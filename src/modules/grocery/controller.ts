import { Request, Response } from 'express';
import { prisma } from '../../main';

const GROCERY_MODULE_SLUG = 'grocery';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const categories = await prisma.category.findMany({
      where: {
        module: { slug: GROCERY_MODULE_SLUG },
        status: 'active',
      },
    });

    const translated = categories.map(c => {
      const nameObj = c.name as any;
      return { ...c, name: nameObj?.[lang] || nameObj?.en || 'Unknown' };
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

    const products = await prisma.product.findMany({
      where: {
        module: { slug: GROCERY_MODULE_SLUG },
        status: 'active',
        categoryId: categoryId as string | undefined,
        OR: q ? [
          { name: { path: [lang], string_contains: q as string } },
          { description: { path: [lang], string_contains: q as string } },
        ] : undefined,
      },
      include: {
        category: true,
        store: true,
      },
      take: Number(limit),
      skip: skip,
    });

    const translated = products.map(p => {
      const nameObj = p.name as any;
      const descObj = p.description as any;
      const catNameObj = p.category?.name as any;
      const storeNameObj = p.store?.name as any;

      return {
        ...p,
        name: nameObj?.[lang] || nameObj?.en || 'Unknown',
        description: descObj?.[lang] || descObj?.en || '',
        category: p.category ? { ...p.category, name: catNameObj?.[lang] || catNameObj?.en || 'Unknown' } : null,
        store: p.store ? { ...p.store, name: storeNameObj?.[lang] || storeNameObj?.en || 'Unknown' } : null,
      };
    });

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        store: true,
        reviews: true,
      },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const nameObj = product.name as any;
    const descObj = product.description as any;
    const catNameObj = product.category?.name as any;
    const storeNameObj = product.store?.name as any;

    const translated = {
      ...product,
      name: nameObj?.[lang] || nameObj?.en || 'Unknown',
      description: descObj?.[lang] || descObj?.en || '',
      category: product.category ? { ...product.category, name: catNameObj?.[lang] || catNameObj?.en || 'Unknown' } : null,
      store: product.store ? { ...product.store, name: storeNameObj?.[lang] || storeNameObj?.en || 'Unknown' } : null,
    };

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Implementation for creating product
    // Needs validation and permission check
    res.status(501).json({ message: 'Not implemented' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Implementation
    res.status(501).json({ message: 'Not implemented' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    // Implementation
    res.status(501).json({ message: 'Not implemented' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
