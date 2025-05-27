// src/validations/userValidation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
        phone: z.string({ required_error: 'Phone is required' }).min(10, 'Phone number seems too short'),
        location: z.string().optional(),
        profileImage: z.string().url('Profile image must be a valid URL').optional(),
    }),
});