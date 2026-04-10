import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import staffRoutes from './modules/staff/staff.routes';
import patientRoutes from './modules/patients/patient.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';
import treatmentRoutes from './modules/treatments/treatment.routes';
import logRoutes from './modules/logs/log.routes';
import imagingRoutes from './modules/imaging/imaging.routes';
import medicineRoutes from './modules/medicines/medicine.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { WatcherService } from './modules/imaging/watcher.service';
import { schedulerService } from './services/scheduler.service';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', system: 'Dental HMS', env: env.NODE_ENV }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/staff', staffRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/treatments', treatmentRoutes);
app.use('/logs', logRoutes);
app.use('/imaging', imagingRoutes);
app.use('/medicines', medicineRoutes);
app.use('/dashboard', dashboardRoutes);

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🦷 Dental HMS API [${env.NODE_ENV}] running on http://localhost:${env.PORT}`);
  
  // Initialize Background Services
  WatcherService.init();
  schedulerService.init();
});
// Triggering server restart for new routes
