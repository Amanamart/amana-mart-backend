import { Router, Request, Response } from 'express';
import { prisma } from '../../main';
import { authenticate, AuthRequest } from '../../common/middleware/auth';

const router = Router();

// Track a parcel
router.get('/track/:id', async (req: Request, res: Response) => {
  try {
    const parcel = await (prisma as any).parcelOrder.findUnique({
      where: { id: req.params.id },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: true, // Assuming a relation or embedded object
      },
    });
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    res.json(parcel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Book a parcel
router.post('/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sender_address, receiver_address, parcel_weight, parcel_type } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const charge = Number(parcel_weight) * 50 + 60; // Mock logic: 50 per kg + 60 base

    const parcel = await (prisma as any).parcelOrder.create({
      data: {
        senderId: req.user.id,
        senderAddress: sender_address,
        receiverAddress: receiver_address,
        weight: Number(parcel_weight),
        type: parcel_type,
        status: 'pending',
        deliveryCharge: charge,
      },
    });

    res.status(201).json(parcel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
