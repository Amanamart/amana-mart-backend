import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const apiKey = process.env.MEILISEARCH_MASTER_KEY || ''; // Use master key for admin operations

export const meilisearch = new Meilisearch({
  host,
  apiKey,
});

export const MEILI_INDEX_PRODUCTS = 'amanamart_products';
export const MEILI_INDEX_CATEGORIES = 'amanamart_categories';
export const MEILI_INDEX_STORES = 'amanamart_stores';
export const MEILI_INDEX_FOOD_ITEMS = 'amanamart_food_items';
export const MEILI_INDEX_RESTAURANTS = 'amanamart_restaurants';
export const MEILI_INDEX_PHARMACY_PRODUCTS = 'amanamart_pharmacy_products';
export const MEILI_INDEX_CLASSIFIED_ADS = 'amanamart_classified_ads';
export const MEILI_INDEX_SERVICES = 'amanamart_services';
export const MEILI_INDEX_ALL = 'amanamart_all';

export const ALL_INDICES = [
  MEILI_INDEX_PRODUCTS,
  MEILI_INDEX_CATEGORIES,
  MEILI_INDEX_STORES,
  MEILI_INDEX_FOOD_ITEMS,
  MEILI_INDEX_RESTAURANTS,
  MEILI_INDEX_PHARMACY_PRODUCTS,
  MEILI_INDEX_CLASSIFIED_ADS,
  MEILI_INDEX_SERVICES,
  MEILI_INDEX_ALL,
];

/**
 * Initialize Meilisearch indices and settings
 */
export const initMeilisearch = async () => {
  try {
    for (const indexUid of ALL_INDICES) {
      const index = meilisearch.index(indexUid);
      
      // Basic settings for products as example
      if (indexUid === MEILI_INDEX_PRODUCTS) {
        await index.updateSettings({
          searchableAttributes: [
            'title_en',
            'title_bn',
            'description_en',
            'description_bn',
            'categoryName_en',
            'categoryName_bn',
            'tags',
            'vendorName',
            'storeName',
          ],
          filterableAttributes: [
            'module',
            'categoryId',
            'vendorId',
            'storeId',
            'zoneIds',
            'price',
            'rating',
            'stockStatus',
            'status',
          ],
          sortableAttributes: ['price', 'rating', 'createdAt', 'updatedAt'],
          rankingRules: [
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
          ],
        });
      }

      // Settings for classified ads
      if (indexUid === MEILI_INDEX_CLASSIFIED_ADS) {
        await index.updateSettings({
          searchableAttributes: [
            'title_en',
            'title_bn',
            'description_en',
            'description_bn',
            'categoryName',
            'sellerName',
            'locationName',
          ],
          filterableAttributes: [
            'categoryId',
            'locationId',
            'price',
            'condition',
            'status',
            'promoted',
          ],
          sortableAttributes: ['price', 'createdAt', 'updatedAt'],
        });
      }
    }
    console.log('Meilisearch indices initialized successfully');
  } catch (error) {
    console.error('Error initializing Meilisearch:', error);
  }
};
