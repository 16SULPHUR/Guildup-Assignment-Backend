
import Package, { IPackage } from '../models/Package.js';
import Course, { ICourse } from '../models/Course.js'; // Ensure ICourse is imported if used for typing
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

// Helper to validate creator (assuming it's already defined as in previous response)
async function validateCreator(creatorId: string | mongoose.Types.ObjectId) {
    if (!mongoose.Types.ObjectId.isValid(String(creatorId))) {
        throw new AppError('Invalid Creator ID format', 400);
    }
    const creator = await User.findById(creatorId);
    if (!creator) {
        throw new AppError('Creator not found', 404);
    }
    return creator;
}


export const createPackageService = async (
    title: string,
    courseMongooseIds: string[],
    creatorMongooseId: string,
    image?: string
): Promise<IPackage> => {
    await validateCreator(creatorMongooseId);

    if (!courseMongooseIds || courseMongooseIds.length === 0) {
        throw new AppError('At least one course ID is required for a package', 400);
    }

    const courses = await Course.find({ _id: { $in: courseMongooseIds } });
    if (courses.length !== courseMongooseIds.length) {
        const foundIds = courses.map(c => c._id.toString());
        const notFoundIds = courseMongooseIds.filter(id => !foundIds.includes(id));
        throw new AppError(`One or more courses not found or invalid: ${notFoundIds.join(', ')}`, 404);
    }

    for (const course of courses) {
        if (course.creatorId.toString() !== creatorMongooseId) {
            throw new AppError(`Course '${course.title}' (ID: ${course.courseId}) does not belong to the specified creator.`, 403);
        }
    }

    const newPackage = new Package({
        title,
        courses: courses.map(c => c._id),
        creatorId: new mongoose.Types.ObjectId(creatorMongooseId),
        image,
    });
    return newPackage.save();
};

export const getAllPackagesService = async (): Promise<(Omit<IPackage, "courses"> & { courses: ICourse[] })[]> => {
    return Package.find()
        .populate('creatorId', 'name email userId')
        .populate<{ courses: ICourse[] }>('courses', 'title price courseId description image'); // Ensure price is populated
};

export const getPackageByIdService = async (packageId: string): Promise<(Omit<IPackage, "courses"> & { courses: ICourse[] }) | null> => {
    const pkg = await Package.findOne({ packageId })
        .populate('creatorId', 'name email userId')
        .populate<{ courses: ICourse[] }>('courses', 'title price courseId description image'); // Ensure price is populated

    if (!pkg) {
        throw new AppError('Package not found', 404);
    }
    return pkg as Omit<IPackage, "courses"> & { courses: ICourse[] };
};

export const deletePackageService = async (packageId: string, MongooseCreatorId: string): Promise<void> => {
    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
        throw new AppError('Package not found', 404);
    }
    if (pkg.creatorId.toString() !== MongooseCreatorId) {
        throw new AppError('You are not authorized to delete this package', 403);
    }
    await Package.deleteOne({ packageId });
};

// Optional: Update Package Service
export const updatePackageService = async (
    packageId: string,
    updateData: Partial<IPackage>,
    MongooseCreatorId: string
): Promise<IPackage | null> => {
    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
        throw new AppError('Package not found', 404);
    }
    if (pkg.creatorId.toString() !== MongooseCreatorId) {
        throw new AppError('You are not authorized to update this package', 403);
    }

    // Prevent direct update of courses array or creatorId through this generic update
    // These should be handled by specific service methods if needed
    if (updateData.courses) delete updateData.courses;
    if (updateData.creatorId) delete updateData.creatorId;


    Object.assign(pkg, updateData);
    return pkg.save();
};