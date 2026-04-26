import { queueService, QUEUES } from '../common/services/queue.service';
import { SearchSyncService } from '../modules/search/search-sync.service';
import { prisma } from '../main';

export const startSearchIndexWorker = async () => {
  console.log('Starting Search Indexing Worker...');
  
  await queueService.consume(QUEUES.SEARCH_INDEXING, async (message: any) => {
    const { entityType, entityId, action } = message;
    console.log(`Processing search indexing job: ${action} ${entityType} ${entityId}`);

    // Create a job record in DB
    const job = await prisma.searchIndexJob.create({
      data: {
        entityType,
        entityId,
        action,
        status: 'processing',
      }
    });

    try {
      if (entityType === 'product') {
        await SearchSyncService.syncProduct(entityId);
      } else if (entityType === 'classified_ad') {
        await SearchSyncService.syncClassifiedAd(entityId);
      } else if (entityType === 'store') {
        await SearchSyncService.syncStore(entityId);
      }
      // Add more entity types as needed

      await prisma.searchIndexJob.update({
        where: { id: job.id },
        data: { status: 'completed' }
      });
    } catch (error: any) {
      console.error(`Error processing job ${job.id}:`, error.message);
      await prisma.searchIndexJob.update({
        where: { id: job.id },
        data: { status: 'failed', errorMessage: error.message }
      });
    }
  });
};
