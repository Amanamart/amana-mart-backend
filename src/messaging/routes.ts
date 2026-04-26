import { Router } from 'express';
import * as MessagingController from './controller';
import { authenticate } from '../common/middleware/auth';

const router = Router();

router.get('/conversations', authenticate, MessagingController.getConversations);
router.post('/conversations', authenticate, MessagingController.createConversation);
router.get('/conversations/:id/messages', authenticate, MessagingController.getMessages);
router.post('/conversations/:id/messages', authenticate, MessagingController.sendMessage);
router.post('/conversations/:id/messages/:msgId/read', authenticate, MessagingController.markRead);
router.get('/conversations/unread-count', authenticate, MessagingController.getUnreadCount);

export default router;

