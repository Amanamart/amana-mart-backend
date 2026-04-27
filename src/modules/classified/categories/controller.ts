import { Request, Response } from 'express';
import categoriesService from './service';

export const categoriesController = {
  async getCategories(req: Request, res: Response) {
    try {
      const lang = (req as any).lang || 'en';
      const cats = await categoriesService.getCategories();
      const translated = cats.map(c => {
        const nameObj = c.name as any;
        return { ...c, name: nameObj?.[lang] || nameObj?.en || 'Unknown' };
      });
      res.json(translated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params as { slug: string };
      const lang = (req as any).lang || 'en';
      const cat = await categoriesService.getCategoryBySlug(slug);
      if (!cat) return res.status(404).json({ message: 'Category not found' });

      const nameObj = cat.name as any;
      const translatedCat = {
        ...cat,
        name: nameObj?.[lang] || nameObj?.en || 'Unknown'
      };

      res.json(translatedCat);
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
      const { id } = req.params as { id: string };
      const cat = await categoriesService.updateCategory(id, req.body);
      res.json(cat);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await categoriesService.deleteCategory(id);
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
      const { id } = req.params as { id: string };
      const fields = await categoriesService.getFields(id);
      res.json(fields);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },

  async createField(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const field = await categoriesService.createField({ ...req.body, categoryId: id });
      res.status(201).json(field);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateField(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const field = await categoriesService.updateField(id, req.body);
      res.json(field);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteField(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await categoriesService.deleteField(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
};

export default categoriesController;
