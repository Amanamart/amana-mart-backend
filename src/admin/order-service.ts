import { prisma } from '../common/lib/prisma';

export const getAllOrders = async () => {
  return prisma.order.findMany({
    include: {
      customer: { select: { name: true, phone: true } },
      store: { select: { name: true } },
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateOrderStatus = async (id: string, status: string) => {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      store: true,
      items: {
        include: { product: true }
      }
    }
  });
};


