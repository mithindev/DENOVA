import { Router } from 'express';
import { logClientError, listLogs, testEmail, testAppointmentReport } from './log.controller';
import { clientLogSchema } from './log.schema';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();

// Retrieve logs (Admin only)
router.get('/', authenticate, authorize(['ADMIN']), listLogs);

// Allow authenticated users to report errors
router.post('/client', authenticate, validate(clientLogSchema), logClientError);

// Diagnostic test endpoints (Public for temporary verification)
router.get('/test-email', testEmail);
router.get('/test-appointments', testAppointmentReport);

export default router;
