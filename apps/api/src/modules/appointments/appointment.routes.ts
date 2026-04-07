import { Router } from 'express';
import { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment } from './appointment.controller';
import { createAppointmentSchema, updateAppointmentSchema } from './appointment.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.use(authenticate);

router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post('/', validate(createAppointmentSchema), createAppointment);
router.patch('/:id', validate(updateAppointmentSchema), updateAppointment);
router.delete('/:id', authorize(['ADMIN', 'DOCTOR']), deleteAppointment);

export default router;
