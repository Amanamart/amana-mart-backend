import { Request, Response } from 'express';
import { meilisearch } from './meilisearch.client';
import { SearchSyncService } from './search-sync.service';
import { prisma } from '../../main';

export const getSearchHealth = async (req: Request, res: Response) => {
  try {
    if (!meilisearch) {
      return res.json({
        status: 'warning',
        meilisearch: { status: 'disabled' },
        fallback: { status: 'available' },
        timestamp: new Date(),
      });
    }

    const health = await meilisearch.health();
    const stats = await meilisearch.getStats();
    res.json({
      status: health.status === 'available' ? 'healthy' : 'unhealthy',
      meilisearch: { status: health.status, stats },
      fallback: { status: 'available' },
      timestamp: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
};

export const reindexAll = async (req: Request, res: Response) => {
  try {
    SearchSyncService.fullReindex().catch(err => console.error('Background reindex failed:', err));
    res.json({ message: 'Reindexing started in background' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSearchLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const logs = await prisma.searchLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip,
    });

    const total = await prisma.searchLog.count();

    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPopularTerms = async (req: Request, res: Response) => {
  try {
    const terms = await prisma.popularSearchTerm.findMany({
      orderBy: { count: 'desc' },
      take: 20,
    });
    res.json(terms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNoResultSearches = async (req: Request, res: Response) => {
  try {
    const searches = await prisma.noResultSearch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(searches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
