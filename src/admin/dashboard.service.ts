import { prisma } from '../common/lib/prisma';

export class DashboardService {
  /**
   * Get overall system statistics for Admin
   */
  async getAdminStats() {
    const [
      userCount,
      orderCount,
      adCount,
      storeCount,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.classifiedAd.count(),
      prisma.store.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      })
    ]);

    return {
      users: userCount,
      orders: orderCount,
      ads: adCount,
      stores: storeCount,
      revenue: totalRevenue._sum.totalAmount || 0
    };
  }

  /**
   * Get user-specific dashboard data
   */
  async getUserStats(userId: string) {
    const [
      activeAds,
      totalOrders,
      unreadMessages,
      verificationStatus
    ] = await Promise.all([
      prisma.classifiedAd.count({ where: { userId, status: 'active' } }),
      prisma.order.count({ where: { customerId: userId } }),
      prisma.messageRead.count({ where: { userId, readAt: null } as any }), // Simplified
      prisma.verifiedProfile.findUnique({ where: { userId }, select: { status: true } })
    ]);

    return {
      activeAds,
      totalOrders,
      unreadMessages,
      isVerified: verificationStatus?.status === 'verified'
    };
  }
}

export default new DashboardService();


