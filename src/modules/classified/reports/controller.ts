import { Request, Response } from 'express';
import reportsService from './service';

export const reportsController = {
  async getReports(req: Request, res: Response) {
    try { res.json(await reportsService.getReports(req.query)); }
    catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async updateReport(req: Request, res: Response) {
    try { res.json(await reportsService.updateReport(req.params.id, req.body)); }
    catch (err: any) { res.status(400).json({ message: err.message }); }
  },
};

export default reportsController;
