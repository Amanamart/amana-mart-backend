import { Request, Response } from 'express';
import { prisma } from '../../main';
import { AuthRequest } from '../../common/middleware/auth';

const PHARMACY_MODULE_SLUG = 'pharmacy';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const pharmacyModule = await prisma.module.findUnique({ where: { slug: PHARMACY_MODULE_SLUG } });
    
    const categories = await prisma.category.findMany({
      where: {
        moduleId: pharmacyModule?.id,
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

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const { q, limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const pharmacyModule = await prisma.module.findUnique({ where: { slug: PHARMACY_MODULE_SLUG } });

    const medicines = await prisma.product.findMany({
      where: {
        moduleId: pharmacyModule?.id,
        status: 'active',
        OR: q ? [
          { description: { contains: q as string, mode: 'insensitive' } },
          { tags: { has: q as string } }, 
        ] : undefined,
      },
      include: {
        category: true,
        store: { select: { id: true, name: true, slug: true } },
      },
      take: Number(limit),
      skip: skip,
    });

    const translated = medicines.map(p => {
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

export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const lang = (req as any).lang || 'en';
    const medicine = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });
    
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    const nameObj = medicine.name as any;
    const catNameObj = (medicine.category?.name) as any;

    const translated = {
      ...medicine,
      name: nameObj?.[lang] || nameObj?.en || medicine.name,
      category: medicine.category
        ? { ...medicine.category, name: catNameObj?.[lang] || catNameObj?.en || medicine.category.name }
        : null,
    };

    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const prescription = await prisma.pharmacyPrescription.create({
      data: {
        userId: req.user.id,
        image: imageUrl,
        status: 'pending',
      },
    });

    res.status(201).json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
