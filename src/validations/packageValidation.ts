// src/validations/packageValidation.ts
import { z } from 'zod';
import mongoose from 'mongoose';

// Reusable ObjectId validation
const objectIdValidation = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId",
});

export const createPackageSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Package title is required' }).min(3),
        courseIds: z.array(objectIdValidation, { required_error: 'Course IDs are required' })
                      .nonempty({ message: 'Package must contain at least one course' }),
        image: z.string().url('Image must be a valid URL').optional(),
        // creatorId is now derived from authenticated user
        // creatorId: objectIdValidation.refine(val => !!val, { message: "Creator ID (Mongoose ObjectId) is required" }),
    }),
});

export const packageIdParamSchema = z.object({
    params: z.object({
        packageId: z.string({ required_error: 'Package ID is required in path parameters' }),
    }),
});

// Optional: If you add an update route for packages
export const updatePackageSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Package title must be at least 3 characters long').optional(),
        // Note: Updating courseIds might require careful logic (add/remove courses)
        // For simplicity, let's assume courseIds are not directly updatable in this schema for now,
        // or would be handled by a dedicated add/remove course to package endpoint.
        // courseIds: z.array(objectIdValidation).nonempty({ message: 'Package must contain at least one course' }).optional(),
        image: z.string().url('Image must be a valid URL').optional(),
    }),
    params: z.object({
        packageId: z.string({ required_error: 'Package ID is required' }),
    }),
});