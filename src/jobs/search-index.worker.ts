import { SearchSyncService } from '../modules/search/search-sync.service';

export const startSearchIndexWorker = async () => {
  // Worker will use direct sync instead of DB job tracking.
  // RabbitMQ is optional — if not configured, silently skip.
  const rabbitmqUrl = process.env.RABBITMQ_URL;
  if (!rabbitmqUrl) {
    console.log('⚠️  RABBITMQ_URL not set. Search index worker not started (will use direct sync).');
    return;
  }

  try {
    const { queueService, QUEUES } = await import('../common/services/queue.service');
    console.log('🔄 Starting Search Indexing Worker...');

    await queueService.consume(QUEUES.SEARCH_INDEXING, async (message: any) => {
      const { entityType, entityId, action } = message;
      console.log(`Processing search indexing job: ${action} ${entityType} ${entityId}`);

      try {
        if (entityType === 'product') {
          await SearchSyncService.syncProduct(entityId);
        } else if (entityType === 'classified_ad') {
          await SearchSyncService.syncClassifiedAd(entityId);
        } else if (entityType === 'store') {
          await SearchSyncService.syncStore(entityId);
        }
        console.log(`✅ Indexed ${entityType} ${entityId}`);
      } catch (error: any) {
        console.error(`❌ Error indexing ${entityType} ${entityId}:`, error.message);
      }
    });
  } catch (err: any) {
    console.error('Failed to start search index worker:', err.message);
  }
};
