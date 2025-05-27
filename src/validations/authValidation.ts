// src/validations/authValidation.ts
import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2),
        email: z.string({ required_error: 'Email is required' }).email(),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
        phone: z.string({ required_error: 'Phone is required' }).min(10),
        location: z.string().optional(),
        profileImage: z.string().url().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email(),
        password: z.string({ required_error: 'Password is required' }),
    }),
});