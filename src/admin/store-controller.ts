import { Request, Response } from 'express';
import * as StoreService from './store-service';

export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await StoreService.getAllStores();
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const store = await StoreService.createStore(req.body);
    res.status(201).json(store);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const store = await StoreService.updateStore(req.params.id as string, req.body);
    res.json(store);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    await StoreService.deleteStore(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



