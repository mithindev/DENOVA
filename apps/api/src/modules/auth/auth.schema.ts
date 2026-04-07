import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(6),
    clinicName: z.string().min(2),
  }),
});
