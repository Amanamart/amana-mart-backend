import { Request, Response } from 'express';
import locationsService from './service';

export const locationsController = {
  async getLocations(_req: Request, res: Response) {
    try {
      const locs = await locationsService.getLocations();
      res.json(locs);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async getLocationBySlug(req: Request, res: Response) {
    try {
      const loc = await locationsService.getLocationBySlug(req.params.slug);
      if (!loc) return res.status(404).json({ message: 'Location not found' });
      res.json(loc);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async adminGetLocations(_req: Request, res: Response) {
    try {
      const locs = await locationsService.adminGetLocations();
      res.json(locs);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
  async createLocation(req: Request, res: Response) {
    try {
      const loc = await locationsService.createLocation(req.body);
      res.status(201).json(loc);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async updateLocation(req: Request, res: Response) {
    try {
      const loc = await locationsService.updateLocation(req.params.id, req.body);
      res.json(loc);
    } catch (err: any) { res.status(400).json({ message: err.message }); }
  },
  async seedLocations(_req: Request, res: Response) {
    try {
      const result = await locationsService.seedLocations();
      res.json(result);
    } catch (err: any) { res.status(500).json({ message: err.message }); }
  },
};

export default locationsController;
