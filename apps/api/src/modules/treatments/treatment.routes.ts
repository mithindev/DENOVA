import { Router } from 'express';
import { listTreatments, createTreatment, updateTreatment, deleteTreatment } from './treatment.controller';
import { createTreatmentSchema, updateTreatmentSchema } from './treatment.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', listTreatments);
router.post('/', validate(createTreatmentSchema), createTreatment);
router.patch('/:id', validate(updateTreatmentSchema), updateTreatment);
router.delete('/:id', deleteTreatment);

export default router;
