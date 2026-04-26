import { Request, Response } from 'express';
import { prisma } from '../../main';
import { meilisearch, MEILI_INDEX_ALL } from './meilisearch.client';
import { SearchResponse } from './search.schemas';

export const globalSearch = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { q, module: moduleSlug, zoneId, limit = 10, page = 1, minPrice, maxPrice, rating, sort, type } = req.query;
  const query = q as string;
  const limitNum = Number(limit);
  const pageNum = Number(page);
  const skip = (pageNum - 1) * limitNum;

  if (!query) {
    return res.json({
      results: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
      query: '',
      processingTimeMs: 0,
      mode: 'meilisearch'
    });
  }

  try {
    // 1. Try Meilisearch
    if (!meilisearch) {
      throw new Error('Meilisearch not configured');
    }
    const index = meilisearch.index(MEILI_INDEX_ALL);
    
    // Construct filters
    const filters: string[] = [];
    
    // Handle App Mismatch: module=stores means type=store, module=items means type=product
    let activeModule = moduleSlug as string;
    let activeType = type as string;

    if (moduleSlug === 'stores') {
      activeType = 'store';
      activeModule = undefined;
    } else if (moduleSlug === 'items') {
      activeType = 'product';
      activeModule = undefined;
    }

    if (activeModule) filters.push(`module = "${activeModule}"`);
    if (activeType) filters.push(`type = "${activeType}"`);
    if (zoneId) filters.push(`zoneIds = "${zoneId}"`);
    if (minPrice) filters.push(`price >= ${minPrice}`);
    if (maxPrice) filters.push(`price <= ${maxPrice}`);
    if (rating) filters.push(`rating >= ${rating}`);
    filters.push(`status = "active"`);

    const searchResults = await index.search(query, {
      limit: limitNum,
      offset: skip,
      filter: filters.join(' AND '),
      sort: sort ? [sort as string] : undefined,
    });

    const processingTimeMs = Date.now() - startTime;

    // Log search
    await prisma.searchLog.create({
      data: {
        query,
        module: moduleSlug as string,
        zoneId: zoneId as string,
        resultCount: searchResults.totalHits,
        mode: 'meilisearch',
        processingTimeMs,
        userId: (req as any).user?.id,
      }
    });

    // Update popular search terms
    await prisma.popularSearchTerm.upsert({
      where: { term_module: { term: query.toLowerCase(), module: (moduleSlug as string) || 'global' } },
      update: { count: { increment: 1 }, lastSearchedAt: new Date() },
      create: { term: query.toLowerCase(), module: (moduleSlug as string) || 'global', count: 1 },
    });

    if (searchResults.totalHits === 0) {
      await prisma.noResultSearch.create({
        data: { query, module: moduleSlug as string, zoneId: zoneId as string }
      });
    }

    const response: SearchResponse = {
      results: searchResults.hits,
      total: searchResults.totalHits,
      page: pageNum,
      limit: limitNum,
      query,
      processingTimeMs,
      mode: 'meilisearch'
    };

    return res.json(response);

  } catch (error: any) {
    console.error('Meilisearch error, falling back to Postgres:', error.message);
    
    // 2. Fallback to PostgreSQL
    try {
      const postgresStartTime = Date.now();
      
      // Handle App Mismatch for Fallback
      let activeModule = moduleSlug as string;
      let activeType = type as string;

      if (moduleSlug === 'stores') {
        activeType = 'store';
        activeModule = undefined;
      } else if (moduleSlug === 'items') {
        activeType = 'product';
        activeModule = undefined;
      }

      const products = activeType === 'store' ? [] : await prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { path: [req.lang || 'en'], string_contains: query } },
                { description: { path: [req.lang || 'en'], string_contains: query } },
              ],
            },
            activeModule ? { store: { module: { slug: activeModule as string } } } : {},
            { status: 'active' },
          ],
        },
        include: {
          store: { include: { module: true } },
        },
        take: limitNum,
        skip: skip,
      });

      const stores = activeType === 'product' ? [] : await prisma.store.findMany({
        where: {
          AND: [
            { name: { contains: query, mode: 'insensitive' } },
            activeModule ? { module: { slug: activeModule as string } } : {},
            { status: 'active' },
          ],
        },
        include: { module: true },
        take: limitNum,
        skip: skip,
      });

      const classifiedAds = (activeType === 'store' || activeType === 'product') ? [] : await prisma.classifiedAd.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            { status: 'active' },
          ],
        },
        take: limitNum,
        skip: skip,
      });

      const totalCount = products.length + stores.length + classifiedAds.length;
      
      const results = [
        ...products.map((p: any) => ({
          id: p.id,
          title: p.name[req.lang || 'en'],
          description: p.description,
          price: p.price,
          module: p.store.module.slug,
          type: 'product',
        })),
        ...stores.map((s: any) => ({
          id: s.id,
          title: s.name,
          description: s.description,
          module: s.module.slug,
          type: 'store',
          imageUrl: s.logo,
        })),
        ...classifiedAds.map((ad) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          price: ad.price,
          module: 'classified',
          type: 'classified_ad',
        })),
      ];

      const processingTimeMs = Date.now() - postgresStartTime;

      // Log fallback search
      await prisma.searchLog.create({
        data: {
          query,
          module: moduleSlug as string,
          zoneId: zoneId as string,
          resultCount: totalCount,
          mode: 'fallback_postgres',
          processingTimeMs,
          userId: (req as any).user?.id,
        }
      });

      const response: SearchResponse = {
        results,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        query,
        processingTimeMs,
        mode: 'fallback_postgres'
      };

      return res.json(response);
    } catch (fallbackError: any) {
      return res.status(500).json({ message: fallbackError.message });
    }
  }
};
