import { Router } from 'express';
import * as ModuleController from './controller';
import { authenticate, authorize } from '../../common/middleware/auth';

const router = Router();

router.get('/', ModuleController.getModules);
router.get('/:slug', ModuleController.getModuleBySlug);
router.post('/', authenticate, authorize(['ADMIN']), ModuleController.createModule);
router.put('/:id', authenticate, authorize(['ADMIN']), ModuleController.updateModule);

export default router;



