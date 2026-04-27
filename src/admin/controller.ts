import { Response } from 'express';
import { AuthRequest } from '../common/middleware/auth';
import * as AdminService from './service';
import { prisma } from '../common/lib/prisma';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [stats, recentOrders, totalProducts] = await Promise.all([
      AdminService.getStats(),
      AdminService.getRecentOrders(),
      prisma.product.count({ where: { status: 'active' } }),
    ]);
    res.json({ stats: { ...stats, totalProducts }, recentOrders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderChartData = async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const data: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const [orders, revenue] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: 'delivered' },
          _sum: { totalAmount: true },
        }),
      ]);
      data.push({
        date: start.toISOString().split('T')[0],
        orders,
        revenue: revenue._sum.totalAmount || 0,
      });
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── User Management ─────────────────────────────────────────────────────────

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: Record<string, unknown> = { role: 'CUSTOMER' };
    if (status) where.status = status;
    if (search) where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string } },
    ];
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, status: true, loyaltyPoints: true, walletBalance: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRiders = async (req: AuthRequest, res: Response) => {
  try {
    const riders = await prisma.user.findMany({
      where: { role: 'RIDER' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, status: true, isOnline: true, riderVehicle: true, zoneId: true, zone: { select: { name: true } }, createdAt: true },
    });
    res.json(riders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { customRole: { select: { name: true, permissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { status },
      select: { id: true, name: true, status: true },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Zone Management ─────────────────────────────────────────────────────────

export const getZones = async (req: AuthRequest, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { name: 'asc' } });
    res.json(zones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createZone = async (req: AuthRequest, res: Response) => {
  try {
    const zone = await prisma.zone.create({ data: req.body });
    res.status(201).json(zone);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateZone = async (req: AuthRequest, res: Response) => {
  try {
    const zone = await prisma.zone.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(zone);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteZone = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Zone deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Category Management ─────────────────────────────────────────────────────

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.query;
    const categories = await prisma.category.findMany({
      where: moduleId ? { moduleId: moduleId as string } : {},
      include: { module: { select: { name: true } }, _count: { select: { products: true } } },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.category.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Module Management ───────────────────────────────────────────────────────

export const getModules = async (req: AuthRequest, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { stores: true, categories: true } } },
    });
    res.json(modules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateModule = async (req: AuthRequest, res: Response) => {
  try {
    const mod = await prisma.module.update({ where: { id: (req.params as any).id }, data: req.body });
    res.json(mod);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Banner Management ───────────────────────────────────────────────────────

export const getBanners = async (req: AuthRequest, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { module: { select: { name: true } }, zone: { select: { name: true } } },
    });
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req: AuthRequest, res: Response) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req: AuthRequest, res: Response) => {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Banner deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Coupon Management ───────────────────────────────────────────────────────

export const getCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { usages: true } } },
    });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Coupon deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Campaign Management ─────────────────────────────────────────────────────

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.create({ data: req.body });
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Campaign deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Flash Sales ─────────────────────────────────────────────────────────────

export const getFlashSales = async (req: AuthRequest, res: Response) => {
  try {
    const sales = await prisma.flashSale.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createFlashSale = async (req: AuthRequest, res: Response) => {
  try {
    const { products, ...data } = req.body;
    const sale = await prisma.flashSale.create({ data });
    res.status(201).json(sale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFlashSale = async (req: AuthRequest, res: Response) => {
  try {
    const flashSale = await prisma.flashSale.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(flashSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFlashSale = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.flashSale.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Flash sale deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.create({ data: { ...req.body, status: 'sent' } });
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Finance ─────────────────────────────────────────────────────────────────

export const getFinanceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const [totalRevenue, totalPending, totalRefunds, totalWithdrawals] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { paymentStatus: 'unpaid', status: { not: 'cancelled' } }, _sum: { totalAmount: true } }),
      prisma.refund.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
      prisma.withdrawalRequest.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    ]);
    res.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalPending: totalPending._sum.totalAmount || 0,
      totalRefunds: totalRefunds._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { orderNumber: true, customer: { select: { name: true } } } } },
      }),
      prisma.transaction.count(),
    ]);
    res.json({ transactions, total, page });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { name: true } },
        rider: { select: { name: true } },
      },
    });
    res.json(withdrawals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWithdrawalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNote } = req.body;
    const withdrawal = await prisma.withdrawalRequest.update({
      where: { id: req.params.id as string },
      data: { status, adminNote },
    });
    res.json(withdrawal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReportsOverview = async (req: AuthRequest, res: Response) => {
  try {
    const [ordersByStatus, topStores, topProducts] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      prisma.store.findMany({
        take: 5,
        orderBy: { orders: { _count: 'desc' } },
        select: { 
          id: true, 
          name: true, 
          _count: { select: { orders: true } } 
        },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);
    res.json({ ordersByStatus, topStores, topProducts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Settings ────────────────────────────────────────────────────────────────

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });
    res.json(settingsMap);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    );
    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Pages (CMS) ─────────────────────────────────────────────────────────────

export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await prisma.pageContent.findMany({ orderBy: { slug: 'asc' } });
    res.json(pages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const page = await prisma.pageContent.upsert({
      where: { slug: req.params.slug as string },
      create: { slug: req.params.slug as string, ...req.body },
      update: req.body,
    });
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── WhatsApp ────────────────────────────────────────────────────────────────

export const getWhatsAppSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.whatsAppSession.findMany({
      orderBy: { lastActivity: 'desc' },
      include: {
        customer: { select: { name: true } },
        _count: { select: { messages: true, orders: true } },
      },
    });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWhatsAppMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { sessionId: req.params.id as string },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, role: true } } },
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ logs, total, page });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const getProductReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.productReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStoreReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.storeReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReviewStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { type, id } = req.params as { type: string; id: string };
    const { status } = req.body;
    if (type === 'product') {
      await prisma.productReview.update({ where: { id }, data: { status } });
    } else {
      await prisma.storeReview.update({ where: { id }, data: { status } });
    }
    res.json({ message: 'Review status updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};





// Attributes
export const getAttributes = async (req: AuthRequest, res: Response) => {
  try {
    const attributes = await prisma.attribute.findMany({
      include: { values: true }
    });
    res.json(attributes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAttribute = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const attribute = await prisma.attribute.create({
      data: { name }
    });
    res.status(201).json(attribute);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttribute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name } = req.body;
    const attribute = await prisma.attribute.update({
      where: { id },
      data: { name }
    });
    res.json(attribute);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAttribute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.attribute.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addAttributeValue = async (req: AuthRequest, res: Response) => {
  try {
    const { id: attributeId } = req.params as { id: string };
    const { value } = req.body;
    const attributeValue = await prisma.attributeValue.create({
      data: { attributeId, value }
    });
    res.status(201).json(attributeValue);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAttributeValue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.attributeValue.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};



