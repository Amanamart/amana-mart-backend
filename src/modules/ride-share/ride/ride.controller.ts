import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Ride sharing service' }));
router.get('/history', (req, res) => res.json({ history: [] }));
router.post('/request', (req, res) => res.json({ status: 'pending' }));

export default router;
