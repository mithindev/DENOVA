import { Router } from 'express';
import { ImagingService } from './imaging.service';

const router = Router();

/**
 * GET /imaging/patient/:id
 * Returns a list of image metadata for a patient.
 */
router.get('/patient/:id', async (req, res) => {
  const images = await ImagingService.getPatientImages(req.params.id);
  res.json(images);
});

/**
 * GET /imaging/:id
 * Streams the binary data of an image.
 */
router.get('/:id', async (req, res) => {
  const record = await ImagingService.getImageData(req.params.id);
  
  res.set('Content-Type', record.mimeType);
  res.set('Content-Length', record.fileSize.toString());
  res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  
  res.send(record.imageData);
});

export default router;
