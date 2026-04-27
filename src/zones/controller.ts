import { Request, Response } from 'express';
import { prisma } from '../common/lib/prisma';

export const getZones = async (req: Request, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({
      where: { status: 'active' },
    });
    res.json({ success: true, data: zones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createZone = async (req: Request, res: Response) => {
  try {
    // Schema: Zone has name, area (text), status — no coordinates field
    const { name, area = '' } = req.body;
    const zone = await prisma.zone.create({
      data: { name, area, status: 'active' },
    });
    res.json({ success: true, data: zone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
