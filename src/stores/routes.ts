import { Router } from 'express';
import * as StoreController from './controller';

const router = Router();

router.get('/', StoreController.getStores);
router.get('/:id', StoreController.getStoreById);

export default router;