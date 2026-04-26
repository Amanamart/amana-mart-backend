import { prisma } from '../../common/lib/prisma';

export const getAll = async () => {
  return prisma.module.findMany({
    where: { status: 'active' },
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




