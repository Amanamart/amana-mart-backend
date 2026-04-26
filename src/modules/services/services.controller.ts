import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Home services marketplace' }));
router.get('/categories', (req, res) => res.json({ categories: [] }));
router.post('/book', (req, res) => res.json({ status: 'pending' }));

export default router;
