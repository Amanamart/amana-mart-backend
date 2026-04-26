import { Request, Response } from 'express';
import { prisma } from '../common/lib/prisma';

export class VerifiedController {
  /**
   * Submit a verification request
   */
  async submitRequest(req: Request, res: Response) {
    try {
      const { idNumber, idImage } = req.body;
      const userId = (req as any).user.id;

      const profile = await prisma.verifiedProfile.upsert({
        where: { userId },
        update: {
          idNumber,
          idImage,
          status: 'pending',
        },
        create: {
          userId,
          idNumber,
          idImage,
          status: 'pending',
        },
      });

      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin: Approve or Reject a verification request
   */
  async handleRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const profile = await prisma.verifiedProfile.update({
        where: { id },
        data: {
          status,
          verificationDate: status === 'verified' ? new Date() : null,
        },
      });

      // Update user status if needed
      if (status === 'verified') {
        await prisma.user.update({
          where: { id: profile.userId },
          data: { status: 'active' },
        });
      }

      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new VerifiedController();

