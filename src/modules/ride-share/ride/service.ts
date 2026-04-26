import { prisma } from '../../../common/lib/prisma';

export class RideService {
  /**
   * Create a new ride request
   */
  async requestRide(data: {
    customerId: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffAddress: string;
    dropoffLat: number;
    dropoffLng: number;
    fare: number;
  }) {
    return await prisma.rideRequest.create({
      data: {
        ...data,
        status: 'pending',
      },
    });
  }

  /**
   * Accept a ride request (for drivers)
   */
  async acceptRide(requestId: string, driverId: string, vehicleId: string) {
    return await prisma.rideRequest.update({
      where: { id: requestId },
      data: {
        driverId,
        vehicleId,
        status: 'accepted',
      },
    });
  }

  /**
   * Update ride status
   */
  async updateRideStatus(requestId: string, status: 'ongoing' | 'completed' | 'cancelled') {
    return await prisma.rideRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }

  /**
   * Get nearby ride requests (for drivers)
   * This is a simplified version. In production, use PostGIS.
   */
  async getNearbyRequests(lat: number, lng: number, radiusKm: number = 5) {
    // Basic bounding box calculation
    const degreePerKm = 1 / 111;
    const latDelta = radiusKm * degreePerKm;
    const lngDelta = radiusKm * degreePerKm / Math.cos(lat * Math.PI / 180);

    return await prisma.rideRequest.findMany({
      where: {
        status: 'pending',
        pickupLat: { gte: lat - latDelta, lte: lat + latDelta },
        pickupLng: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      include: {
        customer: {
          select: { name: true, phone: true, image: true }
        }
      }
    });
  }
}

export default new RideService();




