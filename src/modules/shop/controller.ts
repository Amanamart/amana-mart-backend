import { Request, Response } from 'express';
import { prisma } from '../../main';

const SHOP_MODULE_SLUG = 'shop';

export const getShops = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const shops = await prisma.store.findMany({
      where: {
        module: { slug: SHOP_MODULE_SLUG },
        status: 'active',
      },
      include: {
        _count: { select: { products: true } },
      },
    });
    res.json(shops);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { q, categoryId, minPrice, maxPrice, storeId } = req.query;
    const products = await prisma.product.findMany({
      where: {
        module: { slug: SHOP_MODULE_SLUG },
        status: 'active',
        categoryId: categoryId as string | undefined,
        storeId: storeId as string | undefined,
        price: {
          gte: minPrice ? Number(minPrice) : undefined,
          lte: maxPrice ? Number(maxPrice) : undefined,
        },
        OR: q ? [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        store: { select: { name: true, id: true } },
        category: true,
      },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getShopDetails = async (req: Request, res: Response) => {
  try {
    const shop = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          where: { status: 'active' },
          include: { category: true },
        },
      },
    });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
