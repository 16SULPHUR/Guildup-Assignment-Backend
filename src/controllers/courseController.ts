// src/controllers/courseController.ts
import { Request, Response } from 'express';
import * as courseService from '../services/courseService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { ICourse } from '../models/Course.js';
import { getLocalizedPrice } from '../services/pricingService.js';

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required to create a course.', 401);

    const courseData = { ...req.body, creatorId: req.user.id }; // Creator is the logged-in user
    const course = await courseService.createCourseService(courseData);
    res.status(201).json({ status: 'success', data: course });
});

export const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    // ... (localization logic remains same, using req.query.location)
    const userLocation = req.query.location as string || req.headers['x-user-location'] as string;
    let courses = await courseService.getAllCoursesService();

    if (userLocation) {
        const processedCourses = await Promise.all(courses.map(async (courseDoc: ICourse) => {
            const course = courseDoc.toObject ? courseDoc.toObject() : { ...courseDoc };
            const localizedPriceInfo = await getLocalizedPrice(course.price, userLocation);
             if (localizedPriceInfo.isBlacklisted) {
                 return { ...course, localizedPriceInfo: { message: localizedPriceInfo.message, isBlacklisted: true} };
            }
            return { ...course, localizedPriceInfo };
        }));
        res.status(200).json({ status: 'success', results: processedCourses.length, data: processedCourses });
    } else {
        res.status(200).json({ status: 'success', results: courses.length, data: courses });
    }
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
    // ... (localization logic remains same)
    const userLocation = req.query.location as string || req.headers['x-user-location'] as string;
    const courseDoc = await courseService.getCourseByIdService(req.params.courseId);

    if (!courseDoc) {
        throw new AppError('Course not found from controller', 404);
    }
    const course = courseDoc.toObject ? courseDoc.toObject() : { ...courseDoc };

    if (userLocation) {
        const localizedPriceInfo = await getLocalizedPrice(course.price, userLocation);
        if (localizedPriceInfo.isBlacklisted) {
            return res.status(200).json({ status: 'success', data: { ...course, localizedPriceInfo: { message: localizedPriceInfo.message, isBlacklisted: true } } });
        }
        return res.status(200).json({ status: 'success', data: { ...course, localizedPriceInfo }});
    }
    res.status(200).json({ status: 'success', data: course });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required to update a course.', 401);
    // The service will check if req.user.id matches course.creatorId
    const course = await courseService.updateCourseService(req.params.courseId, req.body, req.user.id);
    res.status(200).json({ status: 'success', data: course });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required to delete a course.', 401);
    // The service will check if req.user.id matches course.creatorId
    await courseService.deleteCourseService(req.params.courseId, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});

export const getMyCourses = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Authentication required.', 401);
    // Assuming courseService.getCoursesByCreatorIdService exists or adapt getAllCoursesService
    const courses = await courseService.getCoursesByCreatorIdService(req.user.id);
    res.status(200).json({ status: 'success', results: courses.length, data: courses });
});