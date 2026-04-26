import { prisma } from '../common/lib/prisma';
import { queueService, QUEUES } from '../common/services/queue.service';

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
  const store = await prisma.store.create({
    data,
  });

  // Trigger search indexing
  queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
    entityType: 'store',
    entityId: store.id,
    action: 'create'
  }).catch(err => console.error('Failed to queue search indexing:', err));

  return store;
};

export const updateStore = async (id: string, data: any) => {
  const store = await prisma.store.update({
    where: { id },
    data,
  });

  // Trigger search indexing
  queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
    entityType: 'store',
    entityId: id,
    action: 'update'
  }).catch(err => console.error('Failed to queue search indexing:', err));

  return store;
};

export const deleteStore = async (id: string) => {
  const result = await prisma.store.delete({
    where: { id },
  });

  // Trigger search indexing
  queueService.sendToQueue(QUEUES.SEARCH_INDEXING, {
    entityType: 'store',
    entityId: id,
    action: 'delete'
  }).catch(err => console.error('Failed to queue search indexing:', err));

  return result;
};


