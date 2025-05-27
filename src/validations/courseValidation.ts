// src/validations/courseValidation.ts
import { z } from 'zod';





export const createCourseSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }).min(3),
        description: z.string().optional(),
        price: z.number({ required_error: 'Price is required' }).positive('Price must be a positive number'),
        image: z.string().url('Image must be a valid URL').optional(),
        // creatorId is now derived from authenticated user, so remove from body validation
        // creatorId: objectIdValidation.refine(val => !!val, { message: "Creator ID (ObjectId) is required" }),
    }),
});

export const updateCourseSchema = z.object({
    body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        price: z.number().positive('Price must be a positive number').optional(),
        image: z.string().url('Image must be a valid URL').optional(),
    }),
    params: z.object({
        courseId: z.string({ required_error: 'Course ID is required' }), // Application-level string ID
    }),
});

export const courseIdParamSchema = z.object({
    params: z.object({
        courseId: z.string({ required_error: 'Course ID is required' }),
    }),
});