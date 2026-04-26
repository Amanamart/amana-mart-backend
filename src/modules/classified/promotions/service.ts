import { prisma } from '../../../common/lib/prisma';

export class ClassifiedPromotionsService {
  async getPackages() {
    return prisma.classifiedPromotionPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async boostAd(adId: string, userId: string, packageId: string, paymentRef?: string) {
    const pkg = await prisma.classifiedPromotionPackage.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error('Package not found');

    const ad = await prisma.classifiedAd.findFirst({ where: { id: adId, userId } });
    if (!ad) throw new Error('Ad not found or unauthorized');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    const promo = await prisma.classifiedAdPromotion.create({
      data: { adId, packageId, userId, endDate, paidAmount: pkg.price, paymentRef },
      include: { package: true }
    });

    // Update ad promotion flags
    const updateData: any = { isPromoted: true };
    if (pkg.type === 'top_ad') updateData.isTopAd = true;
    if (pkg.type === 'urgent') updateData.isUrgent = true;
    if (pkg.type === 'featured' || pkg.type === 'homepage_featured') updateData.isFeatured = true;
    updateData.promotionType = pkg.type;

    await prisma.classifiedAd.update({ where: { id: adId }, data: updateData });

    return promo;
  }

  async adminGetPromotions(filters: any) {
    const { page = '1', limit = '20', status } = filters;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const where: any = {};
    if (status) where.status = status;

    const [promotions, total] = await Promise.all([
      prisma.classifiedAdPromotion.findMany({
        where, skip: (pageNum - 1) * limitNum, take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          ad: { select: { title: true, slug: true } },
          package: { select: { name: true, type: true } },
          user: { select: { name: true, email: true } },
        }
      }),
      prisma.classifiedAdPromotion.count({ where }),
    ]);
    return { promotions, total };
  }

  async adminGetPackages() {
    return prisma.classifiedPromotionPackage.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createPackage(data: any) {
    return prisma.classifiedPromotionPackage.create({ data });
  }

  async updatePackage(id: string, data: any) {
    return prisma.classifiedPromotionPackage.update({ where: { id }, data });
  }

  async seedDefaultPackages() {
    const packages = [
      { name: 'Top Ad', slug: 'top-ad', type: 'top_ad', price: 99, durationDays: 7, sortOrder: 1 },
      { name: 'Urgent Ad', slug: 'urgent-ad', type: 'urgent', price: 49, durationDays: 7, sortOrder: 2 },
      { name: 'Featured Ad', slug: 'featured-ad', type: 'featured', price: 199, durationDays: 7, sortOrder: 3 },
      { name: 'Homepage Featured', slug: 'homepage-featured', type: 'homepage_featured', price: 499, durationDays: 3, sortOrder: 4 },
      { name: 'Bump Up', slug: 'bump-up', type: 'bump_up', price: 29, durationDays: 1, sortOrder: 5 },
    ];
    let created = 0;
    for (const pkg of packages) {
      const exists = await prisma.classifiedPromotionPackage.findUnique({ where: { slug: pkg.slug } });
      if (!exists) { await prisma.classifiedPromotionPackage.create({ data: pkg }); created++; }
    }
    return { created };
  }
}

export default new ClassifiedPromotionsService();
