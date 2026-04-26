import { Router } from 'express';
import * as GroceryController from './controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

// Public routes
router.get('/categories', GroceryController.getCategories);
router.get('/products', GroceryController.getProducts);
router.get('/products/:id', GroceryController.getProductById);

// Protected routes (Admin/Vendor)
router.post('/products', authenticate, GroceryController.createProduct);
router.put('/products/:id', authenticate, GroceryController.updateProduct);
router.delete('/products/:id', authenticate, GroceryController.deleteProduct);

export default router;
