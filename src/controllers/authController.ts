// src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, phone, location, profileImage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('User with this email already exists', 409);
    }

    const newUser = new User({ name, email, password, phone, location, profileImage });
    await newUser.save();

    // Don't send password back, even hashed, by default
    const userResponse = newUser.toObject();
    delete userResponse.password;


    // Optionally sign a token immediately upon registration
    const token = signToken(newUser._id.toString());


    res.status(201).json({
        status: 'success',
        token, // Send token on registration
        data: {
            user: userResponse,
        },
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password'); // Explicitly select password

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Incorrect email or password', 401);
    }

    const token = signToken(user._id.toString());

    // Don't send password back
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: userResponse,
        },
    });
});

// Optional: Get current logged-in user's profile
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    // req.user is populated by the authMiddleware
    if (!req.user) {
        throw new AppError('User not found from token. This should not happen.', 500);
    }
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new AppError('The user belonging to this token no longer exists.', 401);
    }
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});