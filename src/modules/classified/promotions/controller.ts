import { Request, Response } from 'express';
import promotionsService from './service';

export const promotionsController = {
  async getPackages(_req: Request, res: Response) {
    try { res.json(await promotionsService.getPackages()); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async boostAd(req: Request, res: Response) {
    try {
      const { adId } = req.params as { adId: string };
      const userId = (req as any).user.id;
      const { packageId, paymentRef } = req.body;
      const result = await promotionsService.boostAd(adId, userId, packageId, paymentRef);
      res.status(201).json(result);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async adminGetPromotions(req: Request, res: Response) {
    try { res.json(await promotionsService.adminGetPromotions(req.query)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async adminGetPackages(_req: Request, res: Response) {
    try { res.json(await promotionsService.adminGetPackages()); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async createPackage(req: Request, res: Response) {
    try { res.status(201).json(await promotionsService.createPackage(req.body)); }
    catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async updatePackage(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      res.json(await promotionsService.updatePackage(id, req.body));
    }
    catch (err: any) { res.status(400).json({ message: err.message }); }
  },
};

export default promotionsController;
