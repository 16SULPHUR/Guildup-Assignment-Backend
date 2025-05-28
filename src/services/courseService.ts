
import Course, { ICourse } from '../models/Course.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { Types } from 'mongoose';


// Helper to validate creator
async function validateCreator(creatorId: string | Types.ObjectId) {
    if (!Types.ObjectId.isValid(String(creatorId))) {
        throw new AppError('Invalid Creator ID format', 400);
    }
    const creator = await User.findById(creatorId);
    if (!creator) {
        throw new AppError('Creator not found', 404);
    }
    return creator;
}

export const createCourseService = async (courseData: Partial<ICourse>): Promise<ICourse> => {
    if (!courseData.creatorId) {
        throw new AppError('Creator ID is required', 400);
    }
    await validateCreator(courseData.creatorId as unknown as string | Types.ObjectId);

    const course = new Course(courseData);
    return course.save();
};

export const getAllCoursesService = async (): Promise<ICourse[]> => {
    // Later, we can integrate pricingService here
    return Course.find().populate('creatorId', 'name email userId');
};

export const getCourseByIdService = async (courseId: string): Promise<ICourse | null> => {
    const course = await Course.findOne({ courseId }).populate('creatorId', 'name email userId');
    if (!course) {
        throw new AppError('Course not found', 404);
    }
    // Later, integrate pricingService
    return course;
};

export const updateCourseService = async (courseId: string, updateData: Partial<ICourse>, MongooseCreatorId: string): Promise<ICourse | null> => {
    const course = await Course.findOne({ courseId });
    if (!course) {
        throw new AppError('Course not found', 404);
    }
    // Authorization: Check if the updater is the creator
    if (course.creatorId.toString() !== MongooseCreatorId) {
        throw new AppError('You are not authorized to update this course', 403);
    }

    Object.assign(course, updateData);
    return course.save();
};

export const deleteCourseService = async (courseId: string, MongooseCreatorId: string): Promise<void> => {
    const course = await Course.findOne({ courseId });
    if (!course) {
        throw new AppError('Course not found', 404);
    }
    // Authorization
    if (course.creatorId.toString() !== MongooseCreatorId) {
        throw new AppError('You are not authorized to delete this course', 403);
    }
    await Course.deleteOne({ courseId });
};

export const getCoursesByCreatorIdService = async (creatorMongooseId: string): Promise<ICourse[]> => {
    return Course.find({ creatorId: creatorMongooseId })
                 .sort({ createdAt: -1 }) // Optional: sort by newest
                 .populate('creatorId', 'name email userId'); // Keep population consistent
};