import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Vehicle rental service' }));
router.get('/vehicles', (req, res) => res.json({ vehicles: [] }));
router.post('/book', (req, res) => res.json({ status: 'pending' }));

export default router;
