import { Router } from 'express';
import * as WhatsAppController from './controller';

const router = Router();

// Webhook verification (GET) + message handler (POST) — no JWT auth, handled internally
router.get('/webhook', WhatsAppController.verifyWebhook);
router.post('/webhook', WhatsAppController.handleInbound);

export default router;
