import { Request, Response } from 'express';
import * as OrderService from './order-service';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const order = await OrderService.getOrderById(req.params.id as string);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id as string, status);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



