import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string(),
    doctorId: z.string().optional().nullable(),
    date: z.string().datetime(),
    duration: z.number().int().positive().optional(),
    reason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: createAppointmentSchema.shape.body.partial(),
  params: z.object({ id: z.string() }),
});
