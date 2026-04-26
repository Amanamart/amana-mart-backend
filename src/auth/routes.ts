import { Router } from 'express';
import { authenticate } from '../common/middleware/auth';
import * as AuthController from './controller';
import VerifiedController from './verified.controller';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', authenticate, AuthController.getMe);

// Verification routes
router.post('/verify/submit', authenticate, VerifiedController.submitRequest);
router.post('/verify/admin/:id', authenticate, VerifiedController.handleRequest);

export default router;

