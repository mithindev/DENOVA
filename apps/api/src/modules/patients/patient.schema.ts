import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    opNo: z.string().optional().nullable(),
    name: z.string().min(2),
    phone: z.string().optional().nullable(),
    mobile: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(), // Will be coerced if needed
    age: z.number().int().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
    bloodGroup: z.string().optional().nullable(),
    birthWeight: z.number().optional().nullable(),
    currentWeight: z.number().optional().nullable(),
    height: z.number().optional().nullable(),
    fathersName: z.string().optional().nullable(),
    mothersName: z.string().optional().nullable(),
    fatherOccupation: z.string().optional().nullable(),
    motherOccupation: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    address1: z.string().optional().nullable(),
    address2: z.string().optional().nullable(),
    address3: z.string().optional().nullable(),
    regDate: z.string().optional().nullable(),
    doctorId: z.string().optional().nullable(),
    registeredById: z.string().optional().nullable(),
    regFee: z.number().optional().nullable(),
    consulFee: z.number().optional().nullable(),
    otherFee: z.number().optional().nullable(),
    allergies: z.string().optional().nullable(),
    medicalNotes: z.string().optional().nullable(),
  }),
});

export const updatePatientSchema = z.object({
  body: createPatientSchema.shape.body.partial(),
  params: z.object({
    id: z.string(),
  }),
});
