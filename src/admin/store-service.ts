import { prisma } from '../common/lib/prisma';

export const getAllStores = async () => {
  return prisma.store.findMany({
    include: {
      zone: { select: { name: true } },
      module: { select: { name: true } },
      owner: { select: { name: true, email: true } }
    }
  });
};

export const createStore = async (data: any) => {
  return prisma.store.create({
    data,
  });
};

export const updateStore = async (id: string, data: any) => {
  return prisma.store.update({
    where: { id },
    data,
  });
};

export const deleteStore = async (id: string) => {
  return prisma.store.delete({
    where: { id },
  });
};


