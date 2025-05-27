// src/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUserService(req.body);
    res.status(201).json({ status: 'success', data: user });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserByIdService(req.params.userId);
    res.status(200).json({ status: 'success', data: user });
});