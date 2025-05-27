// src/middlewares/authMiddleware.ts
import { Request, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js'; // To check if user still exists

// Extend Express Request type to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: { id: string }; // Or IUser if you fetch the full user object here
        }
    }
}

export const protect = async (req: Request, next: NextFunction) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        // 2) Verification token
        const decoded: any = await verifyToken(token); // 'any' because jwt.verify's payload can be anything

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError('The user belonging to this token does no longer exist.', 401));
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = { id: currentUser._id.toString() }; // Attach user's Mongoose ID
        next();
    } catch (err: any) {
        if (err.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token. Please log in again!', 401));
        }
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired! Please log in again.', 401));
        }
        // For other errors caught by verifyToken or database query
        next(new AppError('Authentication failed. Please try again.', 401));
    }
};