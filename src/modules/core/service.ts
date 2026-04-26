import { prisma } from '../../common/lib/prisma';

export const getAll = async () => {
  return prisma.module.findMany({
    orderBy: { sortOrder: 'asc' },
  });
};

export const getActive = async () => {
  return prisma.module.findMany({
    where: { status: 'active' },
    orderBy: { sortOrder: 'asc' },
  });
};

export const getByZone = async (zoneId: string) => {
  // Find modules that have active stores in the specified zone
  const stores = await prisma.store.findMany({
    where: {
      status: 'active',
      zoneIds: { has: zoneId },
    },
    select: { moduleId: true },
    distinct: ['moduleId'],
  });

  const moduleIds = stores.map(s => s.moduleId);

  return prisma.module.findMany({
    where: {
      id: { in: moduleIds },
      status: 'active',
    },
    orderBy: { sortOrder: 'asc' },
  });
};

export const getBySlug = async (slug: string) => {
  return prisma.module.findUnique({
    where: { slug },
  });
};

export const create = async (data: any) => {
  return prisma.module.create({
    data,
  });
};

export const update = async (id: string, data: any) => {
  return prisma.module.update({
    where: { id },
    data,
  });
};




