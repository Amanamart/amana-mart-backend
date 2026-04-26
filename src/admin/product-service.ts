import { prisma } from '../common/lib/prisma';

export const getAllProducts = async () => {
  return prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      store: { select: { name: true } }
    }
  });
};

export const createProduct = async (data: any) => {
  const { variations, attributeValueIds, ...productData } = data;
  
  return prisma.product.create({
    data: {
      ...productData,
      variations: variations ? {
        create: variations
      } : undefined,
      attributeValues: attributeValueIds ? {
        connect: attributeValueIds.map((id: string) => ({ id }))
      } : undefined
    },
    include: {
      variations: true,
      attributeValues: true
    }
  });
};

export const updateProduct = async (id: string, data: any) => {
  const { variations, attributeValueIds, ...productData } = data;

  // For updates, we might want to delete old variations first or update them.
  // For simplicity in this iteration, we'll replace them if provided.
  return prisma.product.update({
    where: { id },
    data: {
      ...productData,
      variations: variations ? {
        deleteMany: {},
        create: variations
      } : undefined,
      attributeValues: attributeValueIds ? {
        set: attributeValueIds.map((id: string) => ({ id }))
      } : undefined
    },
    include: {
      variations: true,
      attributeValues: true
    }
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id },
  });
};


