import { Router } from 'express';
import * as RiderController from './controller';
import { authenticate } from '../common/middleware/auth';

const router = Router();

router.post('/status', authenticate, RiderController.updateStatus);
router.get('/orders/available', authenticate, RiderController.getAvailableOrders);

export default router;