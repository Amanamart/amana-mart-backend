import { prisma } from '../../../common/lib/prisma';
import { cacheGet, cacheSet, cacheDelete } from '../../../common/lib/redis';
import slugify from 'slugify';
import { queueService, QUEUES } from '../../../common/services/queue.service';

export class ClassifiedAdsService {
  // ────────────────────────────────────────────────
  // PUBLIC: Get all ads with filters
  // ────────────────────────────────────────────────
  async getAds(filters: {
    search?: string;
    categorySlug?: string;
    locationSlug?: string;
    division?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sellerType?: string;
    adType?: string;
    promoted?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    const {
      search, categorySlug, locationSlug, division, district,
      minPrice, maxPrice, condition, sellerType, adType, promoted,
      sort = 'newest', page = '1', limit = '20'
    } = filters;

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    // Resolve category
    let classifiedCategoryId: string | undefined;
    if (categorySlug) {
      const cat = await prisma.classifiedCategory.findUnique({ where: { slug: categorySlug } });
      if (cat) {
        // Get all children too
        const allCats = await this.getCategoryAndChildren(cat.id);
        classifiedCategoryId = cat.id; // simplified
      }
    }

    // Resolve location
    let locationId: string | undefined;
    if (locationSlug) {
      const loc = await prisma.classifiedLocation.findUnique({ where: { slug: locationSlug } });
      if (loc) locationId = loc.id;
    }

    const where: any = {
      status: 'active',
      ...(classifiedCategoryId && { classifiedCategoryId }),
      ...(locationId && { locationId }),
      ...(division && { division }),
      ...(district && { district }),
      ...(condition && { condition }),
      ...(sellerType && { sellerType }),
      ...(adType && { adType }),
      ...(promoted === 'true' && { isPromoted: true }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    };

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      price_low: { price: 'asc' },
      price_high: { price: 'desc' },
      most_viewed: { viewCount: 'desc' },
      promoted_first: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
    }[sort] || { createdAt: 'desc' };

    const [ads, total] = await Promise.all([
      prisma.classifiedAd.findMany({
        where,
        orderBy: Array.isArray(orderBy) ? orderBy : [orderBy],
        skip,
        take: limitNum,
        include: {
          classifiedCategory: { select: { id: true, name: true, slug: true } },
          location: { select: { id: true, name: true, slug: true } },
          seller: {
            select: {
              id: true, shopName: true, isVerified: true, sellerType: true,
              user: { select: { name: true, image: true } }
            }
          },
          media: { where: { isCover: true }, take: 1 },
          adPromotions: { where: { status: 'active', endDate: { gte: new Date() } }, take: 1 },
        },
      }),
      prisma.classifiedAd.count({ where }),
    ]);

    return {
      ads: ads.map(ad => this.formatAd(ad)),
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  // ────────────────────────────────────────────────
  // PUBLIC: Get ad by slug
  // ────────────────────────────────────────────────
  async getAdBySlug(slug: string, userId?: string, ip?: string) {
    const ad = await prisma.classifiedAd.findUnique({
      where: { slug },
      include: {
        classifiedCategory: {
          include: {
            parent: { select: { id: true, name: true, slug: true } },
            fields: { orderBy: { sortOrder: 'asc' } }
          }
        },
        location: true,
        seller: {
          include: {
            user: { select: { id: true, name: true, image: true, createdAt: true } }
          }
        },
        user: { select: { id: true, name: true, image: true, createdAt: true } },
        media: { orderBy: { sortOrder: 'asc' } },
        fieldValues: true,
        adPromotions: { where: { status: 'active', endDate: { gte: new Date() } } },
        reports: { take: 1 },
      },
    });

    if (!ad) return null;

    // Record view asynchronously
    prisma.classifiedAdView.create({
      data: { adId: ad.id, userId: userId || null, ip: ip || null }
    }).catch(() => {});

    // Increment view count
    prisma.classifiedAd.update({
      where: { id: ad.id },
      data: { viewCount: { increment: 1 } }
    }).catch(() => {});

    // Get similar ads
    const similar = await prisma.classifiedAd.findMany({
      where: {
        classifiedCategoryId: ad.classifiedCategoryId,
        status: 'active',
        id: { not: ad.id }
      },
      include: {
        media: { where: { isCover: true }, take: 1 },
        location: { select: { name: true } },
      },
      orderBy: { isPromoted: 'desc' },
      take: 6,
    });

    return { ad: this.formatAdFull(ad), similar: similar.map(s => this.formatAd(s)) };
  }

  // ────────────────────────────────────────────────
  // SELLER: Create ad
  // ────────────────────────────────────────────────
  async createAd(userId: string, data: any) {
    // Ensure seller profile exists
    let seller = await prisma.classifiedSeller.findUnique({ where: { userId } });
    if (!seller) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      seller = await prisma.classifiedSeller.create({
        data: {
          userId,
          phone: user?.phone,
          sellerType: data.sellerType || 'individual',
        }
      });
    }

    // Generate unique slug
    const baseSlug = slugify(data.title, { lower: true, strict: true });
    const unique = Date.now().toString(36);
    const slug = `${baseSlug}-${unique}`;

    // Calculate expiry (30 days default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const ad = await prisma.classifiedAd.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        price: parseFloat(data.price) || 0,
        negotiable: Boolean(data.negotiable),
        condition: data.condition || 'used',
        adType: data.adType || 'sale',
        sellerType: data.sellerType || 'individual',
        classifiedCategoryId: data.classifiedCategoryId,
        categoryId: data.categoryId,
        userId,
        sellerId: seller.id,
        locationId: data.locationId,
        division: data.division,
        district: data.district,
        area: data.area,
        contactPhone: data.contactPhone || seller.phone,
        whatsappNumber: data.whatsappNumber,
        hidePhone: Boolean(data.hidePhone),
        preferredContact: data.preferredContact || 'call',
        status: 'pending_review',
        expiresAt,
        fieldValues: data.fieldValues?.length ? {
          create: data.fieldValues.map((fv: any) => ({
            fieldName: fv.fieldName,
            fieldValue: fv.fieldValue,
          }))
        } : undefined,
      },
      include: {
        fieldValues: true,
        classifiedCategory: { select: { id: true, name: true, slug: true } },
      }
    });

    // Handle media if provided
    if (data.mediaIds?.length) {
      await prisma.classifiedAdMedia.createMany({
        data: data.mediaIds.map((url: string, i: number) => ({
          adId: ad.id,
          url,
          sortOrder: i,
          isCover: i === 0,
        }))
      });
    }

    // Update seller ad count
    await prisma.classifiedSeller.update({
      where: { id: seller.id },
      data: { totalAds: { increment: 1 } }
    });

    await cacheDelete('classified_ads_recent');

    // Trigger search indexing
    queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
      entityType: 'classified_ad',
      entityId: ad.id,
      action: 'create'
    }).catch(err => console.error('Failed to queue search indexing:', err));

    return ad;
  }

  // ────────────────────────────────────────────────
  // SELLER: Update own ad
  // ────────────────────────────────────────────────
  async updateAd(adId: string, userId: string, data: any) {
    const ad = await prisma.classifiedAd.findFirst({
      where: { id: adId, userId },
    });
    if (!ad) throw new Error('Ad not found or unauthorized');
    if (!['draft', 'rejected', 'paused', 'active'].includes(ad.status)) {
      throw new Error('Cannot edit ad in current status');
    }

    const updatedAd = await prisma.classifiedAd.update({
      where: { id: adId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        negotiable: data.negotiable !== undefined ? Boolean(data.negotiable) : undefined,
        condition: data.condition,
        adType: data.adType,
        locationId: data.locationId,
        division: data.division,
        district: data.district,
        area: data.area,
        contactPhone: data.contactPhone,
        whatsappNumber: data.whatsappNumber,
        hidePhone: data.hidePhone !== undefined ? Boolean(data.hidePhone) : undefined,
        status: ad.status === 'rejected' ? 'pending_review' : ad.status,
      },
    });

    // Update field values
    if (data.fieldValues) {
      await prisma.classifiedAdFieldValue.deleteMany({ where: { adId } });
      if (data.fieldValues.length) {
        await prisma.classifiedAdFieldValue.createMany({
          data: data.fieldValues.map((fv: any) => ({
            adId,
            fieldName: fv.fieldName,
            fieldValue: fv.fieldValue,
          }))
        });
      }
    }

    // Trigger search indexing
    queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
      entityType: 'classified_ad',
      entityId: adId,
      action: 'update'
    }).catch(err => console.error('Failed to queue search indexing:', err));

    return updatedAd;
  }

  // ────────────────────────────────────────────────
  // SELLER: Delete own ad
  // ────────────────────────────────────────────────
  async deleteAd(adId: string, userId: string) {
    const ad = await prisma.classifiedAd.findFirst({ where: { id: adId, userId } });
    if (!ad) throw new Error('Ad not found or unauthorized');

    await prisma.classifiedAd.update({
      where: { id: adId },
      data: { status: 'deleted' }
    });

    // Trigger search indexing (delete from index)
    queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
      entityType: 'classified_ad',
      entityId: adId,
      action: 'delete'
    }).catch(err => console.error('Failed to queue search indexing:', err));

    return { success: true };
  }

  // ────────────────────────────────────────────────
  // SELLER: Pause/resume ad
  // ────────────────────────────────────────────────
  async pauseAd(adId: string, userId: string) {
    const ad = await prisma.classifiedAd.findFirst({ where: { id: adId, userId } });
    if (!ad) throw new Error('Ad not found or unauthorized');

    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    return prisma.classifiedAd.update({
      where: { id: adId },
      data: { status: newStatus }
    });
  }

  // ────────────────────────────────────────────────
  // SELLER: Mark as sold/rented
  // ────────────────────────────────────────────────
  async markSold(adId: string, userId: string, type: 'sold' | 'rented' = 'sold') {
    const ad = await prisma.classifiedAd.findFirst({ where: { id: adId, userId } });
    if (!ad) throw new Error('Ad not found or unauthorized');

    return prisma.classifiedAd.update({
      where: { id: adId },
      data: { status: type }
    });
  }

  // ────────────────────────────────────────────────
  // SELLER: Get my ads
  // ────────────────────────────────────────────────
  async getMyAds(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;
    else where.status = { not: 'deleted' };

    return prisma.classifiedAd.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        classifiedCategory: { select: { name: true, slug: true } },
        media: { where: { isCover: true }, take: 1 },
        location: { select: { name: true } },
        adPromotions: { where: { status: 'active' }, take: 1 },
        _count: { select: { conversations: true, savedBy: true } },
      }
    });
  }

  // ────────────────────────────────────────────────
  // SELLER: Save / Unsave ad
  // ────────────────────────────────────────────────
  async saveAd(adId: string, userId: string) {
    const existing = await prisma.classifiedSavedAd.findUnique({
      where: { adId_userId: { adId, userId } }
    });

    if (existing) {
      await prisma.classifiedSavedAd.delete({ where: { adId_userId: { adId, userId } } });
      await prisma.classifiedAd.update({ where: { id: adId }, data: { favoriteCount: { decrement: 1 } } });
      return { saved: false };
    } else {
      await prisma.classifiedSavedAd.create({ data: { adId, userId } });
      await prisma.classifiedAd.update({ where: { id: adId }, data: { favoriteCount: { increment: 1 } } });
      return { saved: true };
    }
  }

  async getSavedAds(userId: string) {
    const saved = await prisma.classifiedSavedAd.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        ad: {
          include: {
            classifiedCategory: { select: { name: true, slug: true } },
            media: { where: { isCover: true }, take: 1 },
            location: { select: { name: true } },
          }
        }
      }
    });
    return saved.map(s => s.ad);
  }

  // ────────────────────────────────────────────────
  // PUBLIC: Report ad
  // ────────────────────────────────────────────────
  async reportAd(adId: string, userId: string, reason: string, message?: string) {
    return prisma.classifiedAdReport.create({
      data: { adId, reporterId: userId, reason, message }
    });
  }

  // ────────────────────────────────────────────────
  // PUBLIC: Reveal phone
  // ────────────────────────────────────────────────
  async revealPhone(adId: string, userId: string) {
    const ad = await prisma.classifiedAd.findUnique({
      where: { id: adId },
      select: { contactPhone: true, hidePhone: true, whatsappNumber: true }
    });
    if (!ad) throw new Error('Ad not found');

    // Log reveal
    await prisma.classifiedPhoneReveal.upsert({
      where: { id: `${adId}_${userId}` },
      create: { adId, userId },
      update: {},
    }).catch(() => {
      prisma.classifiedPhoneReveal.create({ data: { adId, userId } }).catch(() => {});
    });

    await prisma.classifiedAd.update({
      where: { id: adId },
      data: { phoneRevealCount: { increment: 1 } }
    }).catch(() => {});

    return {
      phone: ad.hidePhone ? null : ad.contactPhone,
      whatsapp: ad.whatsappNumber,
    };
  }

  // ────────────────────────────────────────────────
  // ADMIN: Get all ads
  // ────────────────────────────────────────────────
  async adminGetAds(filters: any) {
    const { status, page = '1', limit = '20', search, categoryId } = filters;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.classifiedCategoryId = categoryId;
    if (search) where.title = { contains: search, mode: 'insensitive' as const };

    const [ads, total] = await Promise.all([
      prisma.classifiedAd.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          classifiedCategory: { select: { name: true } },
          user: { select: { name: true, email: true } },
          seller: { select: { shopName: true, isVerified: true } },
          location: { select: { name: true } },
          media: { where: { isCover: true }, take: 1 },
          _count: { select: { reports: true, conversations: true } },
        }
      }),
      prisma.classifiedAd.count({ where }),
    ]);

    return { ads, total, page: pageNum, limit: limitNum };
  }

  // ────────────────────────────────────────────────
  // ADMIN: Approve / Reject / Block
  // ────────────────────────────────────────────────
  async adminApproveAd(adId: string) {
    const ad = await prisma.classifiedAd.update({
      where: { id: adId },
      data: { status: 'active', approvedAt: new Date() },
    });

    // Update seller active count
    if (ad.sellerId) {
      await prisma.classifiedSeller.update({
        where: { id: ad.sellerId },
        data: { activeAds: { increment: 1 } }
      }).catch(() => {});
    }

    // Update category ad count
    if (ad.classifiedCategoryId) {
      await prisma.classifiedCategory.update({
        where: { id: ad.classifiedCategoryId },
        data: { adCount: { increment: 1 } }
      }).catch(() => {});
    }

    // Trigger search indexing
    queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
      entityType: 'classified_ad',
      entityId: adId,
      action: 'update'
    }).catch(err => console.error('Failed to queue search indexing:', err));

    return ad;
  }

  async adminRejectAd(adId: string, reason: string, note?: string) {
    return prisma.classifiedAd.update({
      where: { id: adId },
      data: {
        status: 'rejected',
        rejectReason: reason,
        adminNote: note,
        rejectedAt: new Date(),
      },
    });
  }

  async adminBlockAd(adId: string, note?: string) {
    return prisma.classifiedAd.update({
      where: { id: adId },
      data: { status: 'blocked', adminNote: note },
    });
  }

  async adminFeatureAd(adId: string, featured: boolean) {
    return prisma.classifiedAd.update({
      where: { id: adId },
      data: { isFeatured: featured },
    });
  }

  // ────────────────────────────────────────────────
  // ADMIN: Dashboard stats
  // ────────────────────────────────────────────────
  async getDashboardStats() {
    const [
      total, pending, active, rejected, reported, todayAds,
      activeSellers, topCategories
    ] = await Promise.all([
      prisma.classifiedAd.count(),
      prisma.classifiedAd.count({ where: { status: 'pending_review' } }),
      prisma.classifiedAd.count({ where: { status: 'active' } }),
      prisma.classifiedAd.count({ where: { status: 'rejected' } }),
      prisma.classifiedAd.count({ where: { status: 'reported' } }),
      prisma.classifiedAd.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
      }),
      prisma.classifiedSeller.count({ where: { status: 'active' } }),
      prisma.classifiedCategory.findMany({
        where: { parentId: null, status: 'active' },
        orderBy: { adCount: 'desc' },
        take: 5,
        select: { name: true, adCount: true, slug: true, icon: true }
      }),
    ]);

    return {
      total, pending, active, rejected, reported, todayAds,
      activeSellers, topCategories,
    };
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private async getCategoryAndChildren(categoryId: string): Promise<string[]> {
    const children = await prisma.classifiedCategory.findMany({
      where: { parentId: categoryId },
      select: { id: true }
    });
    const childIds = children.map(c => c.id);
    const nested = await Promise.all(childIds.map(id => this.getCategoryAndChildren(id)));
    return [categoryId, ...childIds, ...nested.flat()];
  }

  private formatAd(ad: any) {
    const coverImage = ad.media?.[0]?.url || ad.images?.[0] || null;
    const isPromoted = (ad.adPromotions?.length > 0) || ad.isPromoted;
    return {
      id: ad.id,
      slug: ad.slug,
      title: ad.title,
      price: ad.price,
      negotiable: ad.negotiable,
      condition: ad.condition,
      adType: ad.adType,
      coverImage,
      location: ad.location?.name || ad.area || ad.district || ad.division,
      category: ad.classifiedCategory,
      seller: ad.seller ? {
        id: ad.seller.id,
        name: ad.seller.shopName || ad.seller.user?.name,
        isVerified: ad.seller.isVerified,
      } : null,
      viewCount: ad.viewCount,
      favoriteCount: ad.favoriteCount,
      isPromoted,
      isFeatured: ad.isFeatured,
      isUrgent: ad.isUrgent,
      isTopAd: ad.isTopAd,
      status: ad.status,
      createdAt: ad.createdAt,
    };
  }

  private formatAdFull(ad: any) {
    const images = ad.media?.map((m: any) => m.url) || ad.images || [];
    return {
      ...ad,
      images,
      coverImage: images[0] || null,
    };
  }
}

export default new ClassifiedAdsService();
