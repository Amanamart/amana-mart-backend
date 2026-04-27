import { Request, Response } from 'express';
import { prisma } from '../../main';

const FOOD_MODULE_SLUG = 'food';

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.query;
    const foodModule = await prisma.module.findUnique({ where: { slug: FOOD_MODULE_SLUG } });
    
    const restaurants = await prisma.store.findMany({
      where: {
        moduleId: foodModule?.id,
        status: 'active',
        zoneIds: zoneId ? { has: zoneId as string } : undefined,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    // Store name is string, so no translation needed for name itself
    // but we can return it as-is.
    res.json(restaurants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const lang = (req as any).lang || 'en';
    const restaurant = await prisma.store.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: 'active' },
          include: { category: true },
        },
      },
    });
    
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const translated = {
      ...restaurant,
      products: restaurant.products.map(p => {
        const pNameObj = p.name as any;
        const pDescObj = p.description as any;
        const catNameObj = (p.category?.name) as any;
        return {
          ...p,
          name: pNameObj?.[lang] || pNameObj?.en || p.name,
          description: pDescObj?.[lang] || pDescObj?.en || p.description,
          category: p.category ? { ...p.category, name: catNameObj?.[lang] || catNameObj?.en || p.category.name } : null,
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
    const foodModule = await prisma.module.findUnique({ where: { slug: FOOD_MODULE_SLUG } });

    const items = await prisma.product.findMany({
      where: {
        moduleId: foodModule?.id,
        status: 'active',
        categoryId: categoryId as string | undefined,
        OR: q ? [
          { description: { contains: q as string, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        store: { select: { name: true, id: true, slug: true } },
      },
    });

    const translated = items.map(p => {
      const nameObj = p.name as any;
      const descObj = p.description as any;
      return {
        ...p,
        name: nameObj?.[lang] || nameObj?.en || p.name,
        description: descObj?.[lang] || descObj?.en || p.description,
        store: p.store ? p.store : null,
      };
    });

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
