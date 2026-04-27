import { Request, Response } from 'express';
import membershipService from './service';

export const membershipController = {
  async getPlans(_req: Request, res: Response) {
    try { res.json(await membershipService.getPlans()); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async applyForMembership(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { planId, paymentRef } = req.body;
      const result = await membershipService.applyForMembership(userId, planId, paymentRef);
      res.status(201).json(result);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async adminGetMemberships(req: Request, res: Response) {
    try { res.json(await membershipService.adminGetMemberships(req.query)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async adminGetPlans(_req: Request, res: Response) {
    try { res.json(await membershipService.adminGetPlans()); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async createPlan(req: Request, res: Response) {
    try { res.status(201).json(await membershipService.createPlan(req.body)); }
    catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      res.json(await membershipService.updatePlan(id, req.body));
    }
    catch (err: any) { res.status(400).json({ message: err.message }); }
  },
};

export default membershipController;
