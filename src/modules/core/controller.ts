import { Request, Response } from 'express';
import * as ModuleService from './service';

export const getModules = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const modules = await ModuleService.getAll();
    const translated = modules.map(m => {
      const nameObj = m.name as any;
      return { ...m, name: nameObj?.[lang] || nameObj?.en || 'Unknown' };
    });
    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveModules = async (req: Request, res: Response) => {
  try {
    const lang = (req as any).lang || 'en';
    const modules = await ModuleService.getActive();
    const translated = modules.map(m => {
      const nameObj = m.name as any;
      return { ...m, name: nameObj?.[lang] || nameObj?.en || 'Unknown' };
    });
    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getModulesByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params as { zoneId: string };
    const lang = (req as any).lang || 'en';
    const modules = await ModuleService.getByZone(zoneId);
    const translated = modules.map(m => {
      const nameObj = m.name as any;
      return { ...m, name: nameObj?.[lang] || nameObj?.en || 'Unknown' };
    });
    res.json(translated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getModuleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const lang = (req as any).lang || 'en';
    const module = await ModuleService.getBySlug(slug);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    
    const nameObj = module.name as any;
    const translatedModule = {
      ...module,
      name: nameObj?.[lang] || nameObj?.en || 'Unknown'
    };
    
    res.json(translatedModule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createModule = async (req: Request, res: Response) => {
  try {
    const module = await ModuleService.create(req.body);
    res.status(201).json(module);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const module = await ModuleService.update(id, req.body);
    res.json(module);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
