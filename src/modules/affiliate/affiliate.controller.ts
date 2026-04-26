import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * @route   GET /api/affiliate/profile
 * @desc    Get current user's affiliate profile
 * @access  Private
 */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let profile = await prisma.affiliateProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { links: true, clicks: true, commissions: true }
        }
      }
    });

    if (!profile) {
      // Create profile if not exists
      profile = await prisma.affiliateProfile.create({
        data: {
          userId,
          referralCode: `AMN${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          status: 'active'
        },
        include: {
          _count: {
            select: { links: true, clicks: true, commissions: true }
          }
        }
      });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/affiliate/stats
 * @desc    Get affiliate statistics
 * @access  Private
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const profile = await prisma.affiliateProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const commissions = await prisma.affiliateCommission.aggregate({
      where: { affiliateId: profile.id, status: 'approved' },
      _sum: { amount: true }
    });

    const clicks = await prisma.affiliateClick.count({
      where: { affiliateId: profile.id }
    });

    res.json({
      totalEarnings: commissions._sum.amount || 0,
      totalClicks: clicks,
      pendingPayout: profile.totalEarnings - profile.paidEarnings
    });
  } catch (error) {
    next(error);
  }
});

export default router;
