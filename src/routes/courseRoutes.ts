
import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createCourseSchema, updateCourseSchema, courseIdParamSchema } from '../validations/courseValidation.js';
import { protect } from '../middlewares/authMiddleware.js'; // Middleware to protect routes
const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/my-courses', protect, courseController.getMyCourses);
router.get('/:courseId', validateRequest(courseIdParamSchema), courseController.getCourse);

// Protected routes (require authentication)
router.post('/', protect, validateRequest(createCourseSchema), courseController.createCourse);
router.put('/:courseId', protect, validateRequest(updateCourseSchema), courseController.updateCourse);
router.delete('/:courseId', protect, validateRequest(courseIdParamSchema), courseController.deleteCourse);

export default router;