import { Router } from 'express';
import * as ShopController from './controller';

const router = Router();

// Public routes
router.get('/list', ShopController.getShops);
router.get('/products', ShopController.getProducts);
router.get('/:id', ShopController.getShopDetails);

export default router;
