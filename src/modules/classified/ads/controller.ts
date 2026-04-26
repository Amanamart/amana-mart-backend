import { Request, Response } from 'express';
import adsService from './service';

export const classifiedAdsController = {
  // GET /api/classified/ads
  async getAds(req: Request, res: Response) {
    try {
      const result = await adsService.getAds(req.query as any);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // GET /api/classified/ads/:slug
  async getAdBySlug(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const ip = req.ip || req.socket.remoteAddress;
      const result = await adsService.getAdBySlug(req.params.slug, userId, ip);
      if (!result) return res.status(404).json({ message: 'Ad not found' });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // POST /api/classified/ads
  async createAd(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const ad = await adsService.createAd(userId, req.body);
      res.status(201).json(ad);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // PATCH /api/classified/ads/:id
  async updateAd(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const ad = await adsService.updateAd(req.params.id, userId, req.body);
      res.json(ad);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // DELETE /api/classified/ads/:id
  async deleteAd(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await adsService.deleteAd(req.params.id, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // POST /api/classified/ads/:id/pause
  async pauseAd(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await adsService.pauseAd(req.params.id, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // POST /api/classified/ads/:id/mark-sold
  async markSold(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const type = req.body.type || 'sold';
      const result = await adsService.markSold(req.params.id, userId, type);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // GET /api/classified/my-ads
  async getMyAds(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const status = req.query.status as string;
      const ads = await adsService.getMyAds(userId, status);
      res.json(ads);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // POST /api/classified/ads/:id/save
  async saveAd(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await adsService.saveAd(req.params.id, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // GET /api/classified/saved
  async getSavedAds(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const ads = await adsService.getSavedAds(userId);
      res.json(ads);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  // POST /api/classified/ads/:id/report
  async reportAd(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { reason, message } = req.body;
      const result = await adsService.reportAd(req.params.id, userId, reason, message);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // POST /api/classified/ads/:id/reveal-phone
  async revealPhone(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await adsService.revealPhone(req.params.id, userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  // ─── ADMIN ────────────────────────────────────
  async adminGetAds(req: Request, res: Response) {
    try {
      const result = await adsService.adminGetAds(req.query);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async adminApproveAd(req: Request, res: Response) {
    try {
      const ad = await adsService.adminApproveAd(req.params.id);
      res.json(ad);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async adminRejectAd(req: Request, res: Response) {
    try {
      const { reason, note } = req.body;
      const ad = await adsService.adminRejectAd(req.params.id, reason, note);
      res.json(ad);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async adminBlockAd(req: Request, res: Response) {
    try {
      const { note } = req.body;
      const ad = await adsService.adminBlockAd(req.params.id, note);
      res.json(ad);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async adminFeatureAd(req: Request, res: Response) {
    try {
      const { featured } = req.body;
      const ad = await adsService.adminFeatureAd(req.params.id, Boolean(featured));
      res.json(ad);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await adsService.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
};

export default classifiedAdsController;
