import { Request, Response } from 'express';
import * as ModuleService from './service';

export const getModules = async (req: Request, res: Response) => {
  try {
    const modules = await ModuleService.getAll();
    res.json(modules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getModuleBySlug = async (req: Request, res: Response) => {
  try {
    const module = await ModuleService.getBySlug(req.params.slug as string);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    res.json(module);
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
    const module = await ModuleService.update(req.params.id as string, req.body);
    res.json(module);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};





