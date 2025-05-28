
import express from 'express';
import userRoutes from './userRoutes.js';
import courseRoutes from './courseRoutes.js';
import packageRoutes from './packageRoutes.js';
import authRoutes from './authRoutes.js';
const router = express.Router();

router.use('/auth', authRoutes); // Authentication routes
router.use('/users', userRoutes); // User related routes (e.g., get public profile)
router.use('/courses', courseRoutes);
router.use('/packages', packageRoutes);

router.get('/health', (res) => res.status(200).json({ status: 'UP' }));

export default router;