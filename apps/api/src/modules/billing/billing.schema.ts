import { z } from 'zod';

export const createBillingSchema = z.object({
  body: z.object({
    appointmentId: z.string(),
    totalAmount: z.number().positive(),
    paidAmount: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'INSURANCE']).optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateBillingSchema = z.object({
  body: createBillingSchema.shape.body.omit({ appointmentId: true }).partial(),
  params: z.object({ id: z.string() }),
});
