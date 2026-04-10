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
      return;
    }

    // 1b. Skip already processed files (those with our timestamp pattern)
    // pattern: OP_NO-YYYY-MM-DD...
    if (fileName.includes('-202') && fileName.includes('T')) {
      return;
    }

    // 2. Extract OP Number
    const opNoMatch = fileName.match(/^([a-zA-Z0-9]+)/);
    if (!opNoMatch) {
      console.warn(`⚠️ Could not extract OP Number from filename: ${fileName}`);
      return;
    }

    const opNo = opNoMatch[1];

    try {
      const buffer = fs.readFileSync(filePath);
      const mimeType = (lookup as any).lookup(filePath) || 'image/jpeg';

      // 3. Ingest into DB
      const result = await ImagingService.ingestImage(opNo, buffer, fileName, mimeType);
      
      if (result.isNew) {
        console.log(`✅ Successfully ingested: ${fileName}`);
      } else {
        console.log(`ℹ️ Duplicate detected for ${fileName}. Skipping database entry.`);
      }

      // 4. Rename original file to prevent re-processing
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newFileName = `${opNo}-${timestamp}${ext}`;
      const newPath = path.join(path.dirname(filePath), newFileName);

      fs.renameSync(filePath, newPath);
      console.log(`📝 Renamed original to: ${newFileName}`);

    } catch (error: any) {
      console.error(`❌ Failed to process ${fileName}: ${error.message}`);
    }
  }

  static stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
