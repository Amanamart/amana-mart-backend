import { prisma } from '../common/lib/prisma';

export const getCategories = async (moduleId?: string, parentId?: string | null) => {
  const where: Record<string, unknown> = { status: 'active' };
  if (moduleId) where.moduleId = moduleId;
  if (parentId !== undefined) where.parentId = parentId;

  return prisma.category.findMany({
    where,
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: { children: { where: { status: 'active' }, orderBy: { order: 'asc' } } },
  });
};

export const getAllCategories = async (moduleId?: string) => {
  return prisma.category.findMany({
    where: moduleId ? { moduleId } : {},
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      module: { select: { name: true } },
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });
};

export const getCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: { children: true, module: true },
  });
};

export const createCategory = async (data: {
  name: string;
  slug: string;
  moduleId: string;
  image?: string;
  parentId?: string;
  order?: number;
}) => {
  return prisma.category.create({ data });
};

export const updateCategory = async (id: string, data: Partial<{
  name: string;
  slug: string;
  image: string;
  parentId: string | null;
  status: string;
  order: number;
}>) => {
  return prisma.category.update({ where: { id }, data });
};

export const deleteCategory = async (id: string) => {
  return prisma.category.delete({ where: { id } });
};


