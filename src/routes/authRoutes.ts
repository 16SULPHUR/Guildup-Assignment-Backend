
import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', protect, authController.getMe); // Example protected route

export default router;