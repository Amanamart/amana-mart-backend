import { Request, Response } from 'express';
import sellersService from './service';

export const sellersController = {
  async getSellerById(req: Request, res: Response) {
    try {
      const seller = await sellersService.getSellerById(req.params.id);
      if (!seller) return res.status(404).json({ message: 'Seller not found' });
      res.json(seller);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async getSellerAds(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await sellersService.getSellerAds(req.params.id, page, limit);
      res.json(result);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const profile = await sellersService.updateProfile(userId, req.body);
      res.json(profile);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async adminGetSellers(req: Request, res: Response) {
    try {
      const result = await sellersService.adminGetSellers(req.query);
      res.json(result);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async verifySeller(req: Request, res: Response) {
    try {
      const seller = await sellersService.verifySeller(req.params.id);
      res.json(seller);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async suspendSeller(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      const seller = await sellersService.suspendSeller(req.params.id, reason);
      res.json(seller);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
};

export default sellersController;
