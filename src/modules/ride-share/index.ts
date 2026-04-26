import { Router } from 'express';
import rideRoutes from './ride/ride.controller';
import rentalRoutes from './rental/rental.controller';

const router = Router();

router.use('/ride', rideRoutes);
router.use('/rental', rentalRoutes);

export default router;
