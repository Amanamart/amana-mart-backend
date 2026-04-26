import { Router } from 'express';
import * as StoreController from './controller';
import { authenticate } from '../common/middleware/auth';

const router = Router();

router.get('/', StoreController.getStores);
router.get('/vendor/orders', authenticate, StoreController.getVendorOrders);
router.get('/:id', StoreController.getStoreById);

export default router;