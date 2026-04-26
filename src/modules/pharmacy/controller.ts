import { Request, Response } from 'express';
import { prisma } from '../../main';
import { AuthRequest } from '../../common/middleware/auth';

const PHARMACY_MODULE_SLUG = 'pharmacy';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        module: { slug: PHARMACY_MODULE_SLUG },
        status: 'active',
      },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const medicines = await prisma.product.findMany({
      where: {
        module: { slug: PHARMACY_MODULE_SLUG },
        status: 'active',
        OR: q ? [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
          // genericName is also in Product model according to schema
          { tags: { has: q as string } }, 
        ] : undefined,
      },
      include: {
        category: true,
        store: true,
      },
      take: Number(limit),
      skip: skip,
    });
    res.json(medicines);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const medicine = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        store: true,
      },
    });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Based on the PharmacyPrescription model in schema.prisma
    const prescription = await (prisma as any).pharmacyPrescription.create({
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
