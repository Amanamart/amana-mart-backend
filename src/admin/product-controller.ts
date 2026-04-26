import { Request, Response } from 'express';
import * as ProductService from './product-service';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.updateProduct(req.params.id as string, req.body);
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await ProductService.deleteProduct(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



