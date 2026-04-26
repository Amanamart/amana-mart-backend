import { Request, Response } from 'express';
import { prisma } from '../common/lib/prisma';

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { isOnline } = req.body;
    const userId = (req as any).user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isOnline }
    });

    res.json({ success: true, data: { isOnline: user.isOnline } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.zoneId) return res.status(400).json({ success: false, message: 'Rider not assigned to any zone' });

    const orders = await prisma.order.findMany({
      where: {
        status: 'pending',
        store: {
          zoneIds: { has: user.zoneId }
        }
      },
      include: { store: true, customer: true }
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

