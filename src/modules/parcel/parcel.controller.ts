import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Parcel delivery service' }));
router.post('/book', (req, res) => res.json({ status: 'pending' }));
router.get('/track/:id', (req, res) => res.json({ status: 'in_transit' }));

export default router;
