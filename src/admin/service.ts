import { prisma } from '../common/lib/prisma';

export const getStats = async () => {
  const [totalOrders, totalRevenue, totalCustomers, totalStores] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'delivered' }
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.store.count({ where: { status: 'active' } }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalCustomers,
    totalStores,
  };
};

export const getRecentOrders = async (limit = 5) => {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true } },
      store: { select: { name: true } }
    }
  });
};


