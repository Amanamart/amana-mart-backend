export interface SearchParams {
  q?: string;
  module?: string;
  categoryId?: string;
  zoneId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  results: any[];
  total: number;
  page: number;
  limit: number;
  facets?: any;
  query: string;
  processingTimeMs: number;
  mode: 'meilisearch' | 'fallback_postgres';
}

export interface MeilisearchProductDoc {
  id: string;
  type: string;
  module: string;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  categoryId: string;
  categoryName_en: string;
  categoryName_bn: string;
  vendorId: string;
  vendorName: string;
  storeId: string;
  storeName: string;
  zoneIds: string[];
  price: number;
  discountPrice?: number;
  rating: number;
  stockStatus: string;
  imageUrl: string;
  slug: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeilisearchClassifiedAdDoc {
  id: string;
  type: 'classified_ad';
  module: 'classified';
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  locationId: string;
  locationName: string;
  price: number;
  negotiable: boolean;
  condition: string;
  imageUrl: string;
  slug: string;
  status: string;
  promoted: boolean;
  createdAt: string;
  updatedAt: string;
}
