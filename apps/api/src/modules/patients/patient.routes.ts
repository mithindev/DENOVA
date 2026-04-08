import { Router } from 'express';
import { listPatients, getPatient, createPatient, updatePatient, deletePatient, getNextOpNo, getPatientByOp } from './patient.controller';
import { createPatientSchema, updatePatientSchema } from './patient.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.use(authenticate);

router.get('/', listPatients);
router.get('/next-op-no', getNextOpNo);
router.get('/by-op/:opNo', getPatientByOp);
router.get('/:id', getPatient);
router.post('/', validate(createPatientSchema), createPatient);
router.patch('/:id', validate(updatePatientSchema), updatePatient);
router.delete('/:id', authorize(['ADMIN']), deletePatient);

export default router;
