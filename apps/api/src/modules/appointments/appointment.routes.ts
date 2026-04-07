import { Router } from 'express';
import { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, completeAppointment, getVisitingHistory } from './appointment.controller';
import { createAppointmentSchema, updateAppointmentSchema, completeAppointmentSchema } from './appointment.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

router.use(authenticate);

router.get('/', listAppointments);
router.get('/history', getVisitingHistory);
router.get('/:id', getAppointment);
router.post('/', validate(createAppointmentSchema), createAppointment);
router.post('/:id/complete', validate(completeAppointmentSchema), completeAppointment);
router.patch('/:id', validate(updateAppointmentSchema), updateAppointment);
router.delete('/:id', authorize(['ADMIN', 'DOCTOR']), deleteAppointment);

export default router;
