import { Request, Response } from 'express';
import service from './service';

export class ClassifiedController {
  async create(req: Request, res: Response) {
    try {
      const ad = await service.createAd(req.body);
      res.status(201).json({ success: true, data: ad });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const ads = await service.getAds(req.query);
      res.json({ success: true, data: ads });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const ad = await service.getAdById(id);
      if (!ad) {
        return res.status(404).json({ success: false, message: 'Ad not found' });
      }
      res.json({ success: true, data: ad });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ClassifiedController();
