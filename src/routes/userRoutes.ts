
import express from 'express';
import * as userController from '../controllers/userController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createUserSchema } from '../validations/userValidation.js'; // Assuming you created this

const router = express.Router();

router.post('/', validateRequest(createUserSchema), userController.createUser);
router.get('/:userId', userController.getUser); // Using custom userId

export default router;