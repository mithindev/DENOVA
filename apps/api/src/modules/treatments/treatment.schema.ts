import { z } from 'zod';

export const createTreatmentSchema = z.object({
  body: z.object({
    appointmentId: z.string(),
    name: z.string().min(1),
    toothNumber: z.string().optional().nullable(),
    cost: z.number().positive(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateTreatmentSchema = z.object({
  body: createTreatmentSchema.shape.body.omit({ appointmentId: true }).partial(),
  params: z.object({ id: z.string() }),
});
