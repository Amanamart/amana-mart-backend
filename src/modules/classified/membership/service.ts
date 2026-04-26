import { prisma } from '../../../common/lib/prisma';

export class ClassifiedMembershipService {
  async getPlans() {
    return prisma.classifiedMembershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async applyForMembership(userId: string, planId: string, paymentRef?: string) {
    const plan = await prisma.classifiedMembershipPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    return prisma.classifiedMembership.create({
      data: { userId, planId, endDate, paidAmount: plan.price, paymentRef, status: 'active' },
      include: { plan: true }
    });
  }

  async adminGetMemberships(filters: any) {
    const { page = '1', limit = '20', status } = filters;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const where: any = {};
    if (status) where.status = status;

    const [memberships, total] = await Promise.all([
      prisma.classifiedMembership.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          plan: { select: { name: true, price: true } },
        }
      }),
      prisma.classifiedMembership.count({ where }),
    ]);

    return { memberships, total };
  }

  async adminGetPlans() {
    return prisma.classifiedMembershipPlan.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createPlan(data: any) {
    return prisma.classifiedMembershipPlan.create({ data });
  }

  async updatePlan(id: string, data: any) {
    return prisma.classifiedMembershipPlan.update({ where: { id }, data });
  }

  async seedDefaultPlans() {
    const plans = [
      { name: 'Free', slug: 'free', price: 0, adLimit: 5, imageLimit: 4, sortOrder: 1 },
      { name: 'Member', slug: 'member', price: 299, adLimit: 20, imageLimit: 8, boostCredits: 2, hasShopPage: true, sortOrder: 2 },
      { name: 'Verified Seller', slug: 'verified-seller', price: 599, adLimit: 50, imageLimit: 12, boostCredits: 5, topAdVouchers: 2, hasShopPage: true, hasVerifiedBadge: true, hasAnalytics: true, hasPriority: true, sortOrder: 3 },
      { name: 'Authorized Dealer', slug: 'authorized-dealer', price: 1499, adLimit: 200, imageLimit: 20, boostCredits: 15, topAdVouchers: 5, hasShopPage: true, hasVerifiedBadge: true, hasAnalytics: true, hasPriority: true, hasDedicatedSupport: true, sortOrder: 4 },
      { name: 'Featured Member', slug: 'featured-member', price: 2999, adLimit: 500, imageLimit: 30, boostCredits: 30, topAdVouchers: 10, hasShopPage: true, hasVerifiedBadge: true, hasAnalytics: true, hasPriority: true, hasDedicatedSupport: true, sortOrder: 5 },
    ];

    let created = 0;
    for (const plan of plans) {
      const exists = await prisma.classifiedMembershipPlan.findUnique({ where: { slug: plan.slug } });
      if (!exists) {
        await prisma.classifiedMembershipPlan.create({ data: plan });
        created++;
      }
    }
    return { created };
  }
}

export default new ClassifiedMembershipService();
