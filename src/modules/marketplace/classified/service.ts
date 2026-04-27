import { prisma } from '../../../common/lib/prisma';
import { cacheGet, cacheSet, cacheDelete } from '../../../common/lib/redis';

export class ClassifiedService {
  /**
   * Create a new classified ad
   */
  async createAd(data: any) {
    const ad = await prisma.classifiedAd.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        condition: data.condition || 'used',
        negotiable: data.negotiable || false,
        slug: data.slug || `${data.title.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
        classifiedCategoryId: data.classifiedCategoryId || data.categoryId,
        userId: data.userId,
        division: data.division,
        district: data.district,
        area: data.area,
        latitude: data.latitude,
        longitude: data.longitude,
        media: {
          create: data.images?.map((url: string, index: number) => ({
            url,
            isCover: index === 0,
            sortOrder: index,
          })),
        },
        attributes: {
          create: data.attributes?.map((attr: any) => ({
            name: attr.name,
            value: attr.value,
          })),
        },
      },
      include: {
        attributes: true,
        classifiedCategory: true,
        media: true,
      },
    });
    
    // Invalidate search cache
    await cacheDelete('classified_ads_recent');
    return ad;
  }

  /**
   * Get ads with caching and filtering
   */
  async getAds(filters: any) {
    const cacheKey = `ads_search_${JSON.stringify(filters)}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) return cachedData;

    const { categoryId, division, district, minPrice, maxPrice, condition, search } = filters;

    const ads = await prisma.classifiedAd.findMany({
      where: {
        status: 'active',
        OR: search ? [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ] : undefined,
        AND: [
          categoryId ? { OR: [{ classifiedCategoryId: categoryId }, { categoryId }] } : {},
          division ? { division } : {},
          district ? { district } : {},
          condition ? { condition } : {},
          {
            price: {
              gte: minPrice ? parseFloat(minPrice) : undefined,
              lte: maxPrice ? parseFloat(maxPrice) : undefined,
            }
          }
        ]
      },
      include: {
        classifiedCategory: true,
        media: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Cache for 5 minutes
    await cacheSet(cacheKey, ads, 300);
    return ads;
  }

  /**
   * Get ad by ID
   */
  async getAdById(id: string) {
    const ad = await prisma.classifiedAd.findUnique({
      where: { id },
      include: {
        attributes: true,
        fieldValues: true,
        classifiedCategory: true,
        media: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
          },
        },
      },
    });

    if (ad && ad.status === 'active') {
      // Increment view count asynchronously
      prisma.classifiedAd.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }).catch(console.error);
    }

    return ad;
  }
}

export default new ClassifiedService();
