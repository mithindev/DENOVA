import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { ImagingService } from './imaging.service';
import { env } from '../../config/env';
import lookup from 'mime-types';

export class WatcherService {
  private static watcher: chokidar.FSWatcher | null = null;

  static init() {
    const watchPath = env.IMAGE_WATCH_PATH;

    if (!watchPath) {
      console.warn('⚠️ IMAGE_WATCH_PATH not set. Folder watcher disabled.');
      return;
    }

    if (!fs.existsSync(watchPath)) {
      console.log(`📁 Creating watch directory: ${watchPath}`);
      fs.mkdirSync(watchPath, { recursive: true });
    }

    console.log(`👁️ Starting folder watcher on: ${watchPath}`);

    this.watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      depth: 0,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher.on('add', (filePath) => this.handleNewFile(filePath));
    
    this.watcher.on('error', (error) => {
      console.error(`❌ Watcher error: ${error}`);
    });
  }

  private static async handleNewFile(filePath: string) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // 1. Check if it's an image
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.log(`ℹ️ Skipping non-image file: ${fileName}`);
      return;
    }

    // 2. Extract OP Number (Assume filename starts with OP Number, e.g., "1234.png" or "1234_xray.jpg")
    // Regulation: EzDent usually exports as "OP_NO.jpg"
    const opNoMatch = fileName.match(/^([a-zA-Z0-9]+)/);
    if (!opNoMatch) {
      console.warn(`⚠️ Could not extract OP Number from filename: ${fileName}`);
      return;
    }

    const opNo = opNoMatch[1];
    console.log(`📸 New image detected for OP: ${opNo} (${fileName})`);

    try {
      const buffer = fs.readFileSync(filePath);
      const mimeType = (lookup as any).lookup(filePath) || 'image/jpeg';

      // 3. Ingest into DB
      await ImagingService.ingestImage(opNo, buffer, fileName, mimeType);
      
      console.log(`✅ Successfully ingested: ${fileName}`);

      // 4. Rename original file to prevent re-processing and as requested
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newFileName = `${opNo}-${timestamp}${ext}`;
      const newPath = path.join(path.dirname(filePath), newFileName);

      fs.renameSync(filePath, newPath);
      console.log(`📝 Renamed original to: ${newFileName}`);

    } catch (error: any) {
      console.error(`❌ Failed to process ${fileName}: ${error.message}`);
      
      // If it failed because it already exists or patient not found, move to an "errors" folder?
      // For now, just log it. The user said "Log failures... do NOT crash".
    }
  }

  static stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
