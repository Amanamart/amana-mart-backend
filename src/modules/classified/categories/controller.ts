import { Request, Response } from 'express';
import categoriesService from './service';

export const categoriesController = {
  async getCategories(_req: Request, res: Response) {
    try {
      const cats = await categoriesService.getCategories();
      res.json(cats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const cat = await categoriesService.getCategoryBySlug(req.params.slug);
      if (!cat) return res.status(404).json({ message: 'Category not found' });
      res.json(cat);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async adminGetCategories(_req: Request, res: Response) {
    try {
      const cats = await categoriesService.getCategories();
      res.json(cats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const cat = await categoriesService.createCategory(req.body);
      res.status(201).json(cat);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const cat = await categoriesService.updateCategory(req.params.id, req.body);
      res.json(cat);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      await categoriesService.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async seedCategories(_req: Request, res: Response) {
    try {
      const result = await categoriesService.seedCategories();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getFields(req: Request, res: Response) {
    try {
      const fields = await categoriesService.getFields(req.params.id);
      res.json(fields);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async createField(req: Request, res: Response) {
    try {
      const field = await categoriesService.createField({ ...req.body, categoryId: req.params.id });
      res.status(201).json(field);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateField(req: Request, res: Response) {
    try {
      const field = await categoriesService.updateField(req.params.id, req.body);
      res.json(field);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteField(req: Request, res: Response) {
    try {
      await categoriesService.deleteField(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
};

export default categoriesController;
