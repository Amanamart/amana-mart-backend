import { Request, Response } from 'express';
import { prisma } from '../../main';

export const visualSearch = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Stage 1: Tag-based visual search (real AI integration ready)
    // Production: Call Google Cloud Vision / AWS Rekognition here
    const mockLabels = ['iphone', 'mobile', 'smartphone', 'electronics', 'camera', 'laptop'];
    const detectedLabel = req.file.originalname.toLowerCase().includes('iphone') ? 'iphone' :
                          req.file.originalname.toLowerCase().includes('car') ? 'car' :
                          mockLabels[Math.floor(Math.random() * mockLabels.length)];

    const lang = (req as any).lang || 'en';

    // Search products by tags/name matching detected label
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { tags: { has: detectedLabel } },
          { description: { contains: detectedLabel, mode: 'insensitive' } },
        ],
      },
      include: {
        store: { select: { name: true, slug: true } },
        category: { select: { name: true } },
      },
      take: 20,
    });

    const ads = await prisma.classifiedAd.findMany({
      where: {
        status: 'active',
        OR: [
          { title: { contains: detectedLabel, mode: 'insensitive' } },
          { description: { contains: detectedLabel, mode: 'insensitive' } },
        ],
      },
      include: {
        classifiedCategory: { select: { name: true } },
      },
      take: 20,
    });

    const results = [
      ...products.map(p => ({
        id: p.id,
        name: (p.name as any)?.[lang] || (p.name as any)?.en,
        image: p.images?.[0] || null,
        price: p.price,
        slug: p.slug,
        storeName: p.store?.name,
        type: 'product' as const,
      })),
      ...ads.map(ad => ({
        id: ad.id,
        name: ad.title,
        image: null, // ClassifiedAdMedia is a separate relation, not directly on ad
        price: ad.price,
        slug: ad.slug,
        location: ad.area || ad.district || ad.division,
        type: 'classified_ad' as const,
      })),
    ];

    res.json({
      detectedLabel,
      totalResults: results.length,
      results,
      stage: '1 — tag-based matching (AI integration ready)',
    });
  } catch (error: any) {
    console.error('Visual search error:', error);
    res.status(500).json({ message: error.message });
  }
};
