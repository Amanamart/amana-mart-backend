import { Request, Response } from 'express';
import settingsService from './service';

export const settingsController = {
  async getSettings(_req: Request, res: Response) {
    try { res.json(await settingsService.getSettings()); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async updateSettings(req: Request, res: Response) {
    try { res.json(await settingsService.updateSettings(req.body)); }
    catch (err: any) { res.status(400).json({ message: err.message }); }
  },
};

export default settingsController;
