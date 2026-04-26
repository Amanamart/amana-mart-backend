import { Request, Response } from 'express';
import * as CategoryService from './service';
import { AuthRequest } from '../common/middleware/auth';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { moduleId, parentId } = req.query;
    const categories = await CategoryService.getCategories(
      moduleId as string | undefined,
      parentId as string | null | undefined
    );
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id as string);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await CategoryService.updateCategory(req.params.id as string, req.body);
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    await CategoryService.deleteCategory(req.params.id as string);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};




