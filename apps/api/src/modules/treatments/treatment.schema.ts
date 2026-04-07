import { z } from 'zod';

export const createTreatmentSchema = z.object({
  body: z.object({
    appointmentId: z.string(),
    name: z.string().min(1),
    toothNumber: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    diagnosis: z.string().optional().nullable(),
    treatmentDone: z.string().optional().nullable(),
    quadrantRU: z.string().optional().nullable(),
    quadrantLU: z.string().optional().nullable(),
    quadrantRL: z.string().optional().nullable(),
    quadrantLL: z.string().optional().nullable(),
  }),
});

export const updateTreatmentSchema = z.object({
  body: createTreatmentSchema.shape.body.omit({ appointmentId: true }).partial(),
  params: z.object({ id: z.string() }),
});

// Used to bulk-create multiple treatment rows in a single save
export const bulkCreateTreatmentsSchema = z.object({
  body: z.object({
    appointmentId: z.string(),
    treatments: z.array(
      z.object({
        name: z.string().min(1),
        toothNumber: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        treatmentDone: z.string().optional().nullable(),
        quadrantRU: z.string().optional().nullable(),
        quadrantLU: z.string().optional().nullable(),
        quadrantRL: z.string().optional().nullable(),
        quadrantLL: z.string().optional().nullable(),
      })
    ),
  }),
});
