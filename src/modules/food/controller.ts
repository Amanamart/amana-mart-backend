import { Request, Response } from 'express';
import { prisma } from '../../main';

const FOOD_MODULE_SLUG = 'food';

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const { zoneId } = req.query;
    const restaurants = await prisma.store.findMany({
      where: {
        module: { slug: FOOD_MODULE_SLUG },
        status: 'active',
        zoneId: zoneId as string | undefined,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    const translated = restaurants.map(r => {
      const nameObj = r.name as any;
      return { ...r, name: nameObj?.[lang] || nameObj?.en || 'Unknown' };
    });

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantDetails = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const restaurant = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          where: { status: 'active' },
          include: { category: true },
        },
      },
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const nameObj = restaurant.name as any;
    const translated = {
      ...restaurant,
      name: nameObj?.[lang] || nameObj?.en || 'Unknown',
      products: restaurant.products.map(p => {
        const pNameObj = p.name as any;
        const pDescObj = p.description as any;
        const catNameObj = p.category?.name as any;
        return {
          ...p,
          name: pNameObj?.[lang] || pNameObj?.en || 'Unknown',
          description: pDescObj?.[lang] || pDescObj?.en || '',
          category: p.category ? { ...p.category, name: catNameObj?.[lang] || catNameObj?.en || 'Unknown' } : null,
        };
      }),
    };

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFoodItems = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const { q, categoryId } = req.query;
    const items = await prisma.product.findMany({
      where: {
        module: { slug: FOOD_MODULE_SLUG },
        status: 'active',
        categoryId: categoryId as string | undefined,
        OR: q ? [
          { name: { path: [lang], string_contains: q as string } },
          { description: { path: [lang], string_contains: q as string } },
        ] : undefined,
      },
      include: {
        store: { select: { name: true, id: true } },
      },
    });

    const translated = items.map(p => {
      const nameObj = p.name as any;
      const descObj = p.description as any;
      const storeNameObj = p.store?.name as any;
      return {
        ...p,
        name: nameObj?.[lang] || nameObj?.en || 'Unknown',
        description: descObj?.[lang] || descObj?.en || '',
        store: p.store ? { ...p.store, name: storeNameObj?.[lang] || storeNameObj?.en || 'Unknown' } : null,
      };
    });

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
