import { prisma } from '../../main';
import { meilisearch, MEILI_INDEX_PRODUCTS, MEILI_INDEX_CLASSIFIED_ADS, MEILI_INDEX_ALL, MEILI_INDEX_STORES } from './meilisearch.client';
import { MeilisearchProductDoc, MeilisearchClassifiedAdDoc, MeilisearchStoreDoc } from './search.schemas';

export class SearchSyncService {
  /**
   * Sync a product to Meilisearch
   */
  static async syncProduct(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          store: {
            include: { module: true }
          }
        }
      });

      if (!product) {
        // If product not found in DB, delete from index
        await meilisearch.index(MEILI_INDEX_PRODUCTS).deleteDocument(productId);
        await meilisearch.index(MEILI_INDEX_ALL).deleteDocument(`product_${productId}`);
        return;
      }

      const doc: MeilisearchProductDoc = {
        id: product.id,
        type: 'product',
        module: product.store.module.slug,
        title_en: (product.name as any).en || '',
        title_bn: (product.name as any).bn || '',
        description_en: product.description || '',
        description_bn: product.description || '',
        categoryId: product.categoryId,
        categoryName_en: (product.category.name as any).en || '',
        categoryName_bn: (product.category.name as any).bn || '',
        vendorId: product.store.ownerId,
        vendorName: product.store.name,
        storeId: product.storeId,
        storeName: product.store.name,
        zoneIds: product.store.zoneIds,
        price: product.price,
        discountPrice: product.discountedPrice || undefined,
        rating: product.rating,
        stockStatus: product.stock > 0 ? 'in_stock' : 'out_of_stock',
        imageUrl: product.images[0] || '',
        slug: product.slug,
        tags: product.tags,
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };

      // Index in specific index and global index
      await meilisearch.index(MEILI_INDEX_PRODUCTS).addDocuments([doc]);
      await meilisearch.index(MEILI_INDEX_ALL).addDocuments([{
        ...doc,
        id: `product_${product.id}`,
        originalId: product.id,
      }]);

      console.log(`Synced product ${productId} to Meilisearch`);
    } catch (error: any) {
      console.error(`Error syncing product ${productId}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync a store to Meilisearch
   */
  static async syncStore(storeId: string) {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { module: true }
      });

      if (!store) {
        await meilisearch.index(MEILI_INDEX_STORES).deleteDocument(storeId);
        await meilisearch.index(MEILI_INDEX_ALL).deleteDocument(`store_${storeId}`);
        return;
      }

      const doc: MeilisearchStoreDoc = {
        id: store.id,
        type: 'store',
        module: store.module.slug,
        name_en: store.name,
        name_bn: store.name,
        description_en: store.description || '',
        description_bn: store.description || '',
        imageUrl: store.logo || '',
        coverUrl: store.coverPhoto || '',
        rating: store.rating,
        zoneIds: store.zoneIds,
        status: store.status,
        tags: store.tags,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      };

      await meilisearch.index(MEILI_INDEX_STORES).addDocuments([doc]);
      await meilisearch.index(MEILI_INDEX_ALL).addDocuments([{
        ...doc,
        id: `store_${store.id}`,
        originalId: store.id,
        title_en: store.name, // Mapping name to title for global search consistency
        title_bn: store.name,
      }]);

      console.log(`Synced store ${storeId} to Meilisearch`);
    } catch (error: any) {
      console.error(`Error syncing store ${storeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Sync a classified ad to Meilisearch
   */
  static async syncClassifiedAd(adId: string) {
    try {
      const ad = await prisma.classifiedAd.findUnique({
        where: { id: adId },
        include: {
          category: true,
          user: true
        }
      });

      if (!ad) {
        await meilisearch.index(MEILI_INDEX_CLASSIFIED_ADS).deleteDocument(adId);
        await meilisearch.index(MEILI_INDEX_ALL).deleteDocument(`ad_${adId}`);
        return;
      }

      const doc: MeilisearchClassifiedAdDoc = {
        id: ad.id,
        type: 'classified_ad',
        module: 'classified',
        title_en: ad.title,
        title_bn: ad.title,
        description_en: ad.description || '',
        description_bn: ad.description || '',
        categoryId: ad.categoryId,
        categoryName: (ad.category.name as any).en || '',
        sellerId: ad.userId,
        sellerName: ad.user.name || '',
        locationId: ad.locationId || '',
        locationName: ad.locationName || '',
        price: ad.price,
        negotiable: ad.isNegotiable,
        condition: ad.condition,
        imageUrl: ad.images[0] || '',
        slug: ad.slug,
        status: ad.status,
        promoted: ad.isPromoted,
        createdAt: ad.createdAt.toISOString(),
        updatedAt: ad.updatedAt.toISOString(),
      };

      await meilisearch.index(MEILI_INDEX_CLASSIFIED_ADS).addDocuments([doc]);
      await meilisearch.index(MEILI_INDEX_ALL).addDocuments([{
        ...doc,
        id: `ad_${ad.id}`,
        originalId: ad.id,
      }]);

      console.log(`Synced classified ad ${adId} to Meilisearch`);
    } catch (error: any) {
      console.error(`Error syncing classified ad ${adId}:`, error.message);
      throw error;
    }
  }

  /**
   * Reindex everything
   */
  static async reindexAll() {
    console.log('Starting full reindexing...');
    
    // Index Products
    const products = await prisma.product.findMany({ select: { id: true } });
    for (const p of products) {
      await this.syncProduct(p.id);
    }

    // Index Stores
    const stores = await prisma.store.findMany({ select: { id: true } });
    for (const s of stores) {
      await this.syncStore(s.id);
    }

    // Index Classified Ads
    const ads = await prisma.classifiedAd.findMany({ select: { id: true } });
    for (const ad of ads) {
      await this.syncClassifiedAd(ad.id);
    }

    console.log('Full reindexing completed');
  }
}
