import { Request, Response } from 'express';
import { prisma } from '../common/lib/prisma';

export const getStores = async (req: Request, res: Response) => {
  try {
    const { zoneId, moduleId } = req.query;
    const stores = await prisma.store.findMany({
      where: {
        status: 'active',
        ...(zoneId && { zoneIds: { has: zoneId as string } }),
        ...(moduleId && { moduleId: moduleId as string }),
      },
      include: {
        module: true,
      }
    });
    res.json({ success: true, data: stores });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: 'active' },
          include: { category: true }
        },
        module: true,
      }
    });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // Schema uses ownerId for store owner
    const store = await prisma.store.findFirst({ where: { ownerId: userId } });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found for this vendor' });

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
