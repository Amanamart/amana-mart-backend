import { Request, Response } from 'express';
import { prisma } from '../common/lib/prisma';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { storeId, items, totalAmount, address, paymentMethod } = req.body;
    const userId = (req as any).user.id;

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        storeId,
        totalAmount,
        orderNumber: `ORD-${Date.now()}`,
        deliveryAddress: address,
        paymentMethod,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        }
      }
    });

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { store: true }
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        items: { include: { product: true } },
        rider: true,
      }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
