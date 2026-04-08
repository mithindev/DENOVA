import sharp from 'sharp';
import crypto from 'crypto';
import prisma from '../../services/db.service';
import { env } from '../../config/env';
import { AppError } from '../../lib/AppError';

export class ImagingService {
  private static MAX_SIZE_BYTES = (Number(env.MAX_IMAGE_SIZE_MB) || 10) * 1024 * 1024;

  /**
   * Process and store an image in the database.
   */
  static async ingestImage(opNo: string, buffer: Buffer, originalName: string, mimeType: string) {
    // 1. Validate File Size
    if (buffer.length > this.MAX_SIZE_BYTES) {
      throw new Error(`File too large: ${buffer.length} bytes. Max allowed: ${this.MAX_SIZE_BYTES} bytes.`);
    }

    // 2. Map to Patient
    const patient = await prisma.patient.findFirst({
      where: { opNo: { equals: opNo, mode: 'insensitive' } }
    });

    if (!patient) {
      throw new Error(`Patient with OP Number ${opNo} not found.`);
    }

    // 3. Generate Hash for Deduplication
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const existing = await prisma.imagingRecord.findUnique({
      where: { hash }
    });

    if (existing) {
      throw new Error(`Duplicate image detected (Hash: ${hash.substring(0, 8)}...). Skipping.`);
    }

    // 4. Compress Image if needed
    let processedBuffer = buffer;
    if (mimeType.includes('image/jpeg') || mimeType.includes('image/png')) {
      processedBuffer = await sharp(buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    // 5. Save to Database
    return prisma.imagingRecord.create({
      data: {
        patientId: patient.id,
        fileName: originalName,
        mimeType: 'image/jpeg', // We converted to JPEG in step 4
        imageData: processedBuffer,
        fileSize: processedBuffer.length,
        hash
      }
    });
  }

  /**
   * Get metadata for images belonging to a patient.
   */
  static async getPatientImages(patientId: string) {
    return prisma.imagingRecord.findMany({
      where: { patientId },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get binary data for a specific image.
   */
  static async getImageData(id: string) {
    const record = await prisma.imagingRecord.findUnique({
      where: { id }
    });

    if (!record) throw new AppError('Image not found.', 404);
    return record;
  }
}
