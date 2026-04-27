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
  const lang = (req as any).lang || 'en';

  if (!query) {
    return res.json({ results: [], total: 0, page: pageNum, limit: limitNum, query: '', processingTimeMs: 0, mode: 'meilisearch' });
  }

  try {
    // 1. Try Meilisearch
    if (!meilisearch) throw new Error('Meilisearch not configured');
    const index = meilisearch.index(MEILI_INDEX_ALL);

    const filters: string[] = [];
    let activeModule = moduleSlug as string | undefined;
    let activeType = type as string | undefined;

    if (moduleSlug === 'stores') { activeType = 'store'; activeModule = undefined; }
    else if (moduleSlug === 'items') { activeType = 'product'; activeModule = undefined; }

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
    const totalHits = (searchResults as any).estimatedTotalHits || searchResults.hits.length;

    // Analytics
    prisma.searchLog.create({
      data: {
        userId: (req as any).user?.id,
        query,
        module: moduleSlug as string,
        zoneId: zoneId as string,
        resultCount: totalHits,
        mode: 'meilisearch',
        processingTimeMs,
      }
    }).catch(err => console.error('Failed to log search:', err));

    if (totalHits === 0) {
      prisma.noResultSearch.create({
        data: { query, module: moduleSlug as string, zoneId: zoneId as string }
      }).catch(err => console.error('Failed to log no-result search:', err));
    } else {
      prisma.popularSearchTerm.upsert({
        where: { term_module: { term: query.toLowerCase().trim(), module: (moduleSlug as string) || 'global' } },
        create: { term: query.toLowerCase().trim(), module: (moduleSlug as string) || 'global', count: 1 },
        update: { count: { increment: 1 }, lastSearchedAt: new Date() }
      }).catch(err => console.error('Failed to update popular term:', err));
    }

    const response: SearchResponse = {
      results: searchResults.hits,
      total: totalHits,
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
      let activeModule = moduleSlug as string | undefined;
      let activeType = type as string | undefined;

      if (moduleSlug === 'stores') { activeType = 'store'; activeModule = undefined; }
      else if (moduleSlug === 'items') { activeType = 'product'; activeModule = undefined; }

      const products = activeType === 'store' ? [] : await prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            activeModule ? { store: { module: { slug: activeModule } } } : {},
            { status: 'active' },
          ],
        },
        include: {
          store: { include: { module: true } },
          category: true,
        },
        take: limitNum,
        skip,
      });

      const stores = activeType === 'product' ? [] : await prisma.store.findMany({
        where: {
          AND: [
            { name: { contains: query, mode: 'insensitive' } },
            activeModule ? { module: { slug: activeModule } } : {},
            { status: 'active' },
          ],
        },
        include: { module: true },
        take: limitNum,
        skip,
      });

      const classifiedAds = activeModule && activeModule !== 'classified' ? [] : await prisma.classifiedAd.findMany({
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
        skip,
      });

      const totalCount = products.length + stores.length + classifiedAds.length;
      const processingTimeMs = Date.now() - postgresStartTime;

      const results = [
        ...products.map(p => ({ ...p, type: 'product', module: (p.store as any)?.module?.slug })),
        ...stores.map(s => ({ ...s, type: 'store', module: (s as any).module?.slug })),
        ...classifiedAds.map(a => ({ ...a, type: 'classified_ad', module: 'classified' })),
      ];

      // Analytics for fallback
      prisma.searchLog.create({
        data: {
          userId: (req as any).user?.id,
          query,
          module: moduleSlug as string,
          resultCount: totalCount,
          mode: 'fallback_postgres',
          processingTimeMs,
        }
      }).catch(err => console.error('Failed to log search fallback:', err));

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
