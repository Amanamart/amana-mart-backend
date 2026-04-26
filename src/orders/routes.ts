import { Router } from 'express';
import * as OrderController from './controller';
import { authenticate } from '../common/middleware/auth';

const router = Router();

router.post('/', authenticate, OrderController.createOrder);
router.get('/me', authenticate, OrderController.getMyOrders);

export default router;