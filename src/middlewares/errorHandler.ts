
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

export const errorHandler = (err: Error | AppError, req: Request, res: Response) => {
    console.log('error handler body', req.body);
    console.error('ERROR 💥', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            message: err.message,
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values((err as any).errors).map((el: any) => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        return res.status(400).json({
            status: 'fail',
            message,
        });
    }

    // Handle Mongoose duplicate key errors
    if ((err as any).code === 11000) {
        const value = (err as any).errmsg.match(/(["'])(\\?.)*?\1/)[0];
        const message = `Duplicate field value: ${value}. Please use another value!`;
        return res.status(400).json({
            status: 'fail',
            message,
        });
    }

    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Invalid ${(err as any).path}: ${(err as any).value}.`;
        return res.status(400).json({
            status: 'fail',
            message
        });
    }


    // For other errors, send a generic message
    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
    });
};