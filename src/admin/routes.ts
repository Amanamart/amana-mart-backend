import { Router } from 'express';
import * as AdminController from './controller';
import { authenticate, authorize } from '../common/middleware/auth';
import * as StoreController from './store-controller';
import * as ProductController from './product-controller';
import * as OrderController from './order-controller';

const router = Router();
const adminAuth = [authenticate, authorize(['ADMIN', 'EMPLOYEE'])];

// Dashboard
router.get('/stats', adminAuth, AdminController.getDashboardStats);
router.get('/charts/orders', adminAuth, AdminController.getOrderChartData);

// Store Management
router.get('/stores', adminAuth, StoreController.getStores);
router.post('/stores', adminAuth, StoreController.createStore);
router.put('/stores/:id', adminAuth, StoreController.updateStore);
router.delete('/stores/:id', adminAuth, StoreController.deleteStore);

// Product Management
router.get('/products', adminAuth, ProductController.getProducts);
router.post('/products', adminAuth, ProductController.createProduct);
router.put('/products/:id', adminAuth, ProductController.updateProduct);
router.delete('/products/:id', adminAuth, ProductController.deleteProduct);

// Order Management
router.get('/orders', adminAuth, OrderController.getOrders);
router.get('/orders/:id', adminAuth, OrderController.getOrderDetails);
router.patch('/orders/:id/status', adminAuth, OrderController.updateStatus);

// User Management
router.get('/customers', adminAuth, AdminController.getCustomers);
router.patch('/customers/:id/status', adminAuth, AdminController.updateUserStatus);
router.get('/riders', adminAuth, AdminController.getRiders);
router.patch('/riders/:id/status', adminAuth, AdminController.updateUserStatus);
router.get('/employees', adminAuth, AdminController.getEmployees);

// Zone Management
router.get('/zones', adminAuth, AdminController.getZones);
router.post('/zones', adminAuth, AdminController.createZone);
router.put('/zones/:id', adminAuth, AdminController.updateZone);
router.delete('/zones/:id', adminAuth, AdminController.deleteZone);

// Category Management
router.get('/categories', adminAuth, AdminController.getCategories);
router.post('/categories', adminAuth, AdminController.createCategory);
router.put('/categories/:id', adminAuth, AdminController.updateCategory);
router.delete('/categories/:id', adminAuth, AdminController.deleteCategory);

// Module Management
router.get('/modules', adminAuth, AdminController.getModules);
router.put('/modules/:id', adminAuth, AdminController.updateModule);

// Attribute Management
router.get('/attributes', adminAuth, AdminController.getAttributes);
router.post('/attributes', adminAuth, AdminController.createAttribute);
router.put('/attributes/:id', adminAuth, AdminController.updateAttribute);
router.delete('/attributes/:id', adminAuth, AdminController.deleteAttribute);
router.post('/attributes/:id/values', adminAuth, AdminController.addAttributeValue);
router.delete('/attributes/values/:id', adminAuth, AdminController.deleteAttributeValue);

// Banner Management
router.get('/banners', adminAuth, AdminController.getBanners);
router.post('/banners', adminAuth, AdminController.createBanner);
router.put('/banners/:id', adminAuth, AdminController.updateBanner);
router.delete('/banners/:id', adminAuth, AdminController.deleteBanner);

// Coupon Management
router.get('/coupons', adminAuth, AdminController.getCoupons);
router.post('/coupons', adminAuth, AdminController.createCoupon);
router.put('/coupons/:id', adminAuth, AdminController.updateCoupon);
router.delete('/coupons/:id', adminAuth, AdminController.deleteCoupon);

// Campaign Management
router.get('/campaigns', adminAuth, AdminController.getCampaigns);
router.post('/campaigns', adminAuth, AdminController.createCampaign);
router.put('/campaigns/:id', adminAuth, AdminController.updateCampaign);
router.delete('/campaigns/:id', adminAuth, AdminController.deleteCampaign);

// Flash Sales
router.get('/flash-sales', adminAuth, AdminController.getFlashSales);
router.post('/flash-sales', adminAuth, AdminController.createFlashSale);
router.put('/flash-sales/:id', adminAuth, AdminController.updateFlashSale);
router.delete('/flash-sales/:id', adminAuth, AdminController.deleteFlashSale);

// Notifications
router.get('/notifications', adminAuth, AdminController.getNotifications);
router.post('/notifications', adminAuth, AdminController.sendNotification);

// Finance
router.get('/finance/summary', adminAuth, AdminController.getFinanceSummary);
router.get('/finance/transactions', adminAuth, AdminController.getTransactions);
router.get('/withdrawals', adminAuth, AdminController.getWithdrawals);
router.patch('/withdrawals/:id/status', adminAuth, AdminController.updateWithdrawalStatus);

// Reports
router.get('/reports/overview', adminAuth, AdminController.getReportsOverview);

// System Settings
router.get('/settings', adminAuth, AdminController.getSettings);
router.put('/settings', adminAuth, AdminController.updateSettings);

// Page Content (CMS)
router.get('/pages', adminAuth, AdminController.getPages);
router.put('/pages/:slug', adminAuth, AdminController.updatePage);

// WhatsApp
router.get('/whatsapp/sessions', adminAuth, AdminController.getWhatsAppSessions);
router.get('/whatsapp/sessions/:id/messages', adminAuth, AdminController.getWhatsAppMessages);

// Audit Logs
router.get('/audit-logs', adminAuth, AdminController.getAuditLogs);

// Reviews
router.get('/reviews/products', adminAuth, AdminController.getProductReviews);
router.get('/reviews/stores', adminAuth, AdminController.getStoreReviews);
router.patch('/reviews/:type/:id/status', adminAuth, AdminController.updateReviewStatus);

export default router;

