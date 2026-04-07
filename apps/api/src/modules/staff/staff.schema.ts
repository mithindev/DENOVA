import { z } from 'zod';

// Staff
export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'DOCTOR', 'STAFF']).optional(),
    phone: z.string().min(10),
    speciality: z.string().optional().nullable(),
  }),
});

export const updateStaffSchema = z.object({
  body: createStaffSchema.shape.body.omit({ password: true }).partial(),
  params: z.object({ id: z.string() }),
});
