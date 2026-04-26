import { Router } from 'express';
import * as MediaController from './controller';
import { authenticate, authorize } from '../common/middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), MediaController.listFiles);
router.post('/upload', authenticate, MediaController.upload.single('file'), MediaController.uploadFile);
router.delete('/:id', authenticate, authorize(['ADMIN']), MediaController.deleteFile);
router.get('/stats', authenticate, authorize(['ADMIN']), MediaController.getMediaStats);

export default router;

