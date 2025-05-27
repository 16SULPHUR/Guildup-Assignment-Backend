// src/services/userService.ts
import User, { IUser } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const createUserService = async (userData: Partial<IUser>): Promise<IUser> => {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new AppError('User with this email already exists', 409); // 409 Conflict
    }
    const user = new User(userData);
    return user.save();
};

export const getUserByIdService = async (userId: string): Promise<IUser | null> => {
    const user = await User.findOne({ userId }); // Using custom userId
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

export const getUserByMongooseIdService = async (mongooseId: string): Promise<IUser | null> => {
    const user = await User.findById(mongooseId);
    if (!user) {
        throw new AppError('User not found by Mongoose ID', 404);
    }
    return user;
}