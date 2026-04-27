import { prisma } from '../../../common/lib/prisma';
import { cacheDelete } from '../../../common/lib/redis';

export class PromotionService {
  /**
   * Apply a promotion to an ad
   */
  async applyPromotion(adId: string, type: 'TOP_AD' | 'BUMP_UP' | 'URGENT', durationDays: number) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const promotion = await prisma.adPromotion.create({
      data: {
        adId,
        type,
        startDate,
        endDate,
        status: 'active',
      },
    });

    // Update ad status if needed
    if (type === 'TOP_AD') {
      await prisma.classifiedAd.update({
        where: { id: adId },
        data: { isTopAd: true }, // Schema has isTopAd
      });
    } else if (type === 'URGENT') {
      await prisma.classifiedAd.update({
        where: { id: adId },
        data: { isUrgent: true },
      });
    }

    // Invalidate cache
    await cacheDelete('classified_ads_recent');
    return promotion;
  }

  /**
   * Check and expire promotions (can be run via cron)
   */
  async expirePromotions() {
    const now = new Date();
    const expired = await prisma.adPromotion.updateMany({
      where: {
        endDate: { lt: now },
        status: 'active',
      },
      data: {
        status: 'expired',
      },
    });

    // Update ad flags
    const expiredPromotions = await prisma.adPromotion.findMany({
      where: { status: 'expired' },
      select: { adId: true, type: true },
    });

    for (const promo of expiredPromotions) {
      if (promo.type === 'TOP_AD') {
        await prisma.classifiedAd.update({
          where: { id: promo.adId },
          data: { isTopAd: false },
        });
      } else if (promo.type === 'URGENT') {
        await prisma.classifiedAd.update({
          where: { id: promo.adId },
          data: { isUrgent: false },
        });
      }
    }

    return expired;
  }
}

export default new PromotionService();
