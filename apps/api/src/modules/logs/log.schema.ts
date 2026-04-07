import { z } from 'zod';

export const clientLogSchema = z.object({
  body: z.object({
    message: z.string(),
    stack: z.string().optional(),
    url: z.string().optional(),
    userAgent: z.string().optional(),
  }),
});
