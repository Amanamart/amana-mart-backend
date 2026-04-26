import { Request, Response } from 'express';
import { prisma } from '../../main';
import path from 'path';

export const visualSearch = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // In a real high-scale scenario, we would use:
    // 1. Google Cloud Vision API
    // 2. AWS Rekognition
    // 3. Custom TensorFlow/PyTorch model in a separate microservice
    
    // MOCK AI LOGIC: Extract "labels" based on the filename or just return dummy labels for demo
    // For a real implementation, you'd call an AI service here.
    const mockLabels = ['iphone', 'mobile', 'smartphone', 'electronics', 'camera', 'laptop'];
    const detectedLabel = req.file.originalname.toLowerCase().includes('iphone') ? 'iphone' : 
                          req.file.originalname.toLowerCase().includes('car') ? 'car' : 
                          mockLabels[Math.floor(Math.random() * mockLabels.length)];

    const lang = (req as any).lang || 'en';

    // Search for products matching the detected labels
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { path: [lang], string_contains: detectedLabel } },
          { name: { path: ['en'], string_contains: detectedLabel } },
          { description: { path: [lang], string_contains: detectedLabel } },
        ],
      },
      include: {
        module: true,
        category: true,
        store: true,
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
        category: true,
      },
      take: 20,
    });

    const results = [
      ...products.map(p => ({
        id: p.id,
        name: (p.name as any)?.[lang] || (p.name as any)?.en,
        image: p.image,
        price: p.price,
        module: p.module.slug,
        type: 'product',
        store: (p.store?.name as any)?.[lang] || (p.store?.name as any)?.en,
      })),
      ...ads.map(ad => ({
        id: ad.id,
        name: ad.title,
        image: ad.media?.[0]?.path,
        price: ad.price,
        module: 'classified',
        type: 'ad',
        location: ad.area || ad.location,
      })),
    ];

    res.json({
      detectedLabel,
      results,
      searchImage: req.file.filename,
    });
  } catch (error: any) {
    console.error('Visual search error:', error);
    res.status(500).json({ message: error.message });
  }
};
