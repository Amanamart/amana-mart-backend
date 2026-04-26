import { Router } from 'express';
import * as ZoneController from './controller';
import { authenticate } from '../common/middleware/auth';

const router = Router();

router.get('/', ZoneController.getZones);
router.post('/', authenticate, ZoneController.createZone);

export default router;
