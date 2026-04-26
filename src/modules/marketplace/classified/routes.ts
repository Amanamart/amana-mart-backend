import { Router } from 'express';
import controller from './controller';
import { authenticate } from '../../../common/middleware/auth';

const router = Router();

// Public routes
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Protected routes
router.post('/', authenticate, controller.create);

export default router;




