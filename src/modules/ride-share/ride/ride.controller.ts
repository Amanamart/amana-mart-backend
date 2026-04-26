import { Router, Request, Response } from 'express';
import { prisma } from '../../../main';
import { authenticate, AuthRequest } from '../../../common/middleware/auth';

const router = Router();

// Get ride details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ride = await (prisma as any).rideRequest.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        driver: { select: { id: true, name: true, phone: true, riderVehicle: true } },
      },
    });
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.json(ride);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Request a ride
router.post('/request', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pickup_location, destination_location, vehicle_type } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const ride = await (prisma as any).rideRequest.create({
      data: {
        userId: req.user.id,
        pickupLocation: pickup_location,
        destinationLocation: destination_location,
        vehicleType: vehicle_type,
        status: 'pending',
        estimatedFare: 150.00, // Mock calculation
      },
    });

    res.status(201).json(ride);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get ride history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const history = await (prisma as any).rideRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
