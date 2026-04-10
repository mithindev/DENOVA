import { Router } from 'express';
import * as medicineController from './medicine.controller';
import { validate } from '../../middlewares/validate';
import { createMedicineSchema, getMedicinesSchema } from './medicine.schema';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', validate(getMedicinesSchema), medicineController.getMedicinesHandler);
router.post('/', validate(createMedicineSchema), medicineController.createMedicineHandler);
router.delete('/:id', medicineController.deleteMedicineHandler);

export default router;
