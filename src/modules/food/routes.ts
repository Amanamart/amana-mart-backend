import { Router } from 'express';
import * as FoodController from './controller';

const router = Router();

// Public routes
router.get('/restaurants', FoodController.getRestaurants);
router.get('/restaurants/:id', FoodController.getRestaurantDetails);
router.get('/products', FoodController.getFoodItems);

export default router;
