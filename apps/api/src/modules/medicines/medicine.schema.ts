import { z } from 'zod';

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Medicine name is required',
    }).min(2, 'Name must be at least 2 characters'),
  }),
});

export const getMedicinesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
});
