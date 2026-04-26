import { prisma } from '../common/lib/prisma';
import { queueService, QUEUES } from '../common/services/queue.service';

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
  
  const product = await prisma.product.create({
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

  // Trigger search indexing
  queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
    entityType: 'product',
    entityId: product.id,
    action: 'create'
  }).catch(err => console.error('Failed to queue search indexing:', err));

  return product;
};

export const updateProduct = async (id: string, data: any) => {
  const { variations, attributeValueIds, ...productData } = data;

  // For updates, we might want to delete old variations first or update them.
  // For simplicity in this iteration, we'll replace them if provided.
  const product = await prisma.product.update({
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

  // Trigger search indexing
  queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
    entityType: 'product',
    entityId: id,
    action: 'update'
  }).catch(err => console.error('Failed to queue search indexing:', err));

  return product;
};

export const deleteProduct = async (id: string) => {
  const result = await prisma.product.delete({
    where: { id },
  });

  // Trigger search indexing (for deletion)
  queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
    entityType: 'product',
    entityId: id,
    action: 'delete'
  }).catch(err => console.error('Failed to queue search indexing:', err));

  return result;
};


