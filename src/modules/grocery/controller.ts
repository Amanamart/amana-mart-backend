import { Request, Response } from 'express';
import { prisma } from '../../main';

const GROCERY_MODULE_SLUG = 'grocery';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    // Category has moduleId via module relation
    const module = await prisma.module.findUnique({ where: { slug: GROCERY_MODULE_SLUG } });
    const categories = await prisma.category.findMany({
      where: {
        moduleId: module?.id,
        status: 'active',
      },
    });
    const translated = categories.map(c => {
      const nameObj = c.name as any;
      return { ...c, name: nameObj?.[lang] || nameObj?.en || c.name };
    });
    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const { categoryId, q, limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const module = await prisma.module.findUnique({ where: { slug: GROCERY_MODULE_SLUG } });
    const products = await prisma.product.findMany({
      where: {
        moduleId: module?.id,
        status: 'active',
        categoryId: categoryId as string | undefined,
        OR: q ? [
          { description: { contains: q as string, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        category: true,
        store: { select: { id: true, name: true, slug: true } },
      },
      take: Number(limit),
      skip,
    });

    const translated = products.map(p => {
      const nameObj = p.name as any;
      const catNameObj = (p.category?.name) as any;
      return {
        ...p,
        name: nameObj?.[lang] || nameObj?.en || p.name,
        category: p.category
          ? { ...p.category, name: catNameObj?.[lang] || catNameObj?.en || p.category.name }
          : null,
      };
    });

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const lang = (req as any).lang || 'en';
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        store: { select: { id: true, name: true, slug: true } },
        reviews: true,
      },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const nameObj = product.name as any;
    const catNameObj = (product.category?.name) as any;

    const translated = {
      ...product,
      name: nameObj?.[lang] || nameObj?.en || product.name,
      category: product.category
        ? { ...product.category, name: catNameObj?.[lang] || catNameObj?.en || product.category.name }
        : null,
    };

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
};

export const updateProduct = async (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
};

export const deleteProduct = async (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
};
