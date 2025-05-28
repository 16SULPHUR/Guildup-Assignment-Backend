
import express from 'express';
import * as packageController from '../controllers/packageController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createPackageSchema, packageIdParamSchema, updatePackageSchema } from '../validations/packageValidation.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Public routes
router.get('/', packageController.getAllPackages);
router.get('/:packageId', validateRequest(packageIdParamSchema), packageController.getPackageById);

// Protected routes
router.post('/create', protect, validateRequest(createPackageSchema), packageController.createPackage);
router.put('/:packageId', protect, validateRequest(updatePackageSchema), packageController.updatePackage);
router.delete('/:packageId', protect, validateRequest(packageIdParamSchema), packageController.deletePackageById);

export default router;