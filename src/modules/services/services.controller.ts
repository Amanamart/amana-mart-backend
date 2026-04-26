import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, AuthRequest } from '../../common/middleware/auth';

const router = Router();

const SERVICE_MODULE_SLUG = 'service';

// List available service categories/types
router.get('/list', async (req: Request, res: Response) => {
  try {
    const services = await prisma.product.findMany({
      where: {
        module: { slug: SERVICE_MODULE_SLUG },
        status: 'active',
      },
      include: {
        category: true,
        store: { select: { name: true, rating: true } },
      },
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Book a service
router.post('/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, address, schedule } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Mock booking logic
    const booking = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      userId: req.user.id,
      serviceId,
      address,
      schedule,
      status: 'pending',
      createdAt: new Date(),
    };

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
