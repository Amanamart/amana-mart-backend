import { Router } from 'express';
import * as PharmacyController from './controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

// Public routes
router.get('/categories', PharmacyController.getCategories);
router.get('/products', PharmacyController.getMedicines);
router.get('/products/:id', PharmacyController.getMedicineById);

// Protected routes
router.post('/prescriptions', authenticate, PharmacyController.uploadPrescription);

export default router;
