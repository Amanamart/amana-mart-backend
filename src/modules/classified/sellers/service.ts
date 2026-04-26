import { prisma } from '../../../common/lib/prisma';

export class ClassifiedSellersService {
  async getSellerById(id: string) {
    return prisma.classifiedSeller.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true, createdAt: true } },
        location: { select: { name: true, slug: true } },
        membership: { include: { plan: true } },
      }
    });
  }

  async getSellerAds(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [ads, total] = await Promise.all([
      prisma.classifiedAd.findMany({
        where: { sellerId, status: 'active' },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: {
          classifiedCategory: { select: { name: true, slug: true } },
          media: { where: { isCover: true }, take: 1 },
          location: { select: { name: true } },
        }
      }),
      prisma.classifiedAd.count({ where: { sellerId, status: 'active' } }),
    ]);
    return { ads, total, page, limit };
  }

  async updateProfile(userId: string, data: any) {
    return prisma.classifiedSeller.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async adminGetSellers(filters: any) {
    const { page = '1', limit = '20', search, status } = filters;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const where: any = {};
    if (status) where.status = status;
    if (search) where.user = { name: { contains: search, mode: 'insensitive' as const } };

    const [sellers, total] = await Promise.all([
      prisma.classifiedSeller.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          location: { select: { name: true } },
          membership: { include: { plan: { select: { name: true } } } },
          _count: { select: { ads: true } },
        }
      }),
      prisma.classifiedSeller.count({ where }),
    ]);

    return { sellers, total, page: pageNum, limit: limitNum };
  }

  async verifySeller(id: string) {
    return prisma.classifiedSeller.update({
      where: { id },
      data: { isVerified: true, verifiedAt: new Date() }
    });
  }

  async suspendSeller(id: string, reason?: string) {
    return prisma.classifiedSeller.update({
      where: { id },
      data: { status: 'suspended' }
    });
  }
}

export default new ClassifiedSellersService();
