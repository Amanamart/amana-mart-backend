import { Router } from 'express';
import * as CategoryController from './controller';
import { authenticate, authorize } from '../common/middleware/auth';

const router = Router();

router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', authenticate, authorize(['ADMIN']), CategoryController.createCategory);
router.put('/:id', authenticate, authorize(['ADMIN']), CategoryController.updateCategory);
router.delete('/:id', authenticate, authorize(['ADMIN']), CategoryController.deleteCategory);

export default router;

