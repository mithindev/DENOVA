import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string(),
    doctorId: z.string().optional().nullable(),
    date: z.string().datetime(),
    duration: z.number().int().positive().optional(),
    reason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['WAITING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: createAppointmentSchema.shape.body.partial(),
  params: z.object({ id: z.string() }),
});

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1),
  totalTablets: z.number().int().positive(),
  dosage: z.string().min(1),
  days: z.number().int().positive(),
});

// Schema for the "Save & Complete" action from the Treatments page
export const completeAppointmentSchema = z.object({
  body: z.object({
    allergies: z.string().optional().nullable(),
    clinicalDetails: z.string().optional().nullable(),
    appointmentNotes: z.string().optional().nullable(),
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
    ).optional(),
    prescriptions: z.array(prescriptionItemSchema).optional(),
  }),
  params: z.object({ id: z.string() }),
});
