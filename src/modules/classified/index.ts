import { Router } from 'express';
import { authenticate, optionalAuth } from '../../common/middleware/auth';
import classifiedAdsController from './ads/controller';
import categoriesController from './categories/controller';
import locationsController from './locations/controller';
import sellersController from './sellers/controller';
import chatController from './chat/controller';
import membershipController from './membership/controller';
import promotionsController from './promotions/controller';
import settingsController from './settings/controller';
import reportsController from './reports/controller';

const router = Router();

// ─── CATEGORIES ──────────────────────────────────────────────────
router.get('/categories', categoriesController.getCategories);
router.get('/categories/:slug', categoriesController.getCategoryBySlug);

// ─── LOCATIONS ───────────────────────────────────────────────────
router.get('/locations', locationsController.getLocations);
router.get('/locations/:slug', locationsController.getLocationBySlug);

// ─── ADS (PUBLIC) ────────────────────────────────────────────────
router.get('/ads', classifiedAdsController.getAds);
router.get('/ads/:slug', optionalAuth, classifiedAdsController.getAdBySlug);

// ─── ADS (PROTECTED) ─────────────────────────────────────────────
router.post('/ads', authenticate, classifiedAdsController.createAd);
router.patch('/ads/:id', authenticate, classifiedAdsController.updateAd);
router.delete('/ads/:id', authenticate, classifiedAdsController.deleteAd);
router.post('/ads/:id/pause', authenticate, classifiedAdsController.pauseAd);
router.post('/ads/:id/mark-sold', authenticate, classifiedAdsController.markSold);
router.post('/ads/:id/save', authenticate, classifiedAdsController.saveAd);
router.post('/ads/:id/report', authenticate, classifiedAdsController.reportAd);
router.post('/ads/:id/reveal-phone', authenticate, classifiedAdsController.revealPhone);

// ─── MY ADS / SAVED ──────────────────────────────────────────────
router.get('/my-ads', authenticate, classifiedAdsController.getMyAds);
router.get('/saved', authenticate, classifiedAdsController.getSavedAds);

// ─── SELLERS ─────────────────────────────────────────────────────
router.get('/sellers/:id', sellersController.getSellerById);
router.get('/sellers/:id/ads', sellersController.getSellerAds);
router.patch('/sellers/profile', authenticate, sellersController.updateProfile);

// ─── CHAT ────────────────────────────────────────────────────────
router.get('/chat', authenticate, chatController.getConversations);
router.post('/chat/:adId/start', authenticate, chatController.startConversation);
router.get('/chat/:conversationId/messages', authenticate, chatController.getMessages);
router.post('/chat/:conversationId/message', authenticate, chatController.sendMessage);

// ─── MEMBERSHIP ──────────────────────────────────────────────────
router.get('/membership/plans', membershipController.getPlans);
router.post('/membership/apply', authenticate, membershipController.applyForMembership);

// ─── PROMOTIONS ──────────────────────────────────────────────────
router.get('/promotions/packages', promotionsController.getPackages);
router.post('/promotions/boost/:adId', authenticate, promotionsController.boostAd);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────
router.get('/admin/dashboard', authenticate, classifiedAdsController.getDashboardStats);
router.get('/admin/ads', authenticate, classifiedAdsController.adminGetAds);
router.post('/admin/ads/:id/approve', authenticate, classifiedAdsController.adminApproveAd);
router.post('/admin/ads/:id/reject', authenticate, classifiedAdsController.adminRejectAd);
router.post('/admin/ads/:id/block', authenticate, classifiedAdsController.adminBlockAd);
router.post('/admin/ads/:id/feature', authenticate, classifiedAdsController.adminFeatureAd);

router.get('/admin/categories', authenticate, categoriesController.adminGetCategories);
router.post('/admin/categories', authenticate, categoriesController.createCategory);
router.patch('/admin/categories/:id', authenticate, categoriesController.updateCategory);
router.delete('/admin/categories/:id', authenticate, categoriesController.deleteCategory);
router.post('/admin/categories/seed', authenticate, categoriesController.seedCategories);

router.get('/admin/categories/:id/fields', authenticate, categoriesController.getFields);
router.post('/admin/categories/:id/fields', authenticate, categoriesController.createField);
router.patch('/admin/fields/:id', authenticate, categoriesController.updateField);
router.delete('/admin/fields/:id', authenticate, categoriesController.deleteField);

router.get('/admin/locations', authenticate, locationsController.adminGetLocations);
router.post('/admin/locations', authenticate, locationsController.createLocation);
router.patch('/admin/locations/:id', authenticate, locationsController.updateLocation);
router.post('/admin/locations/seed', authenticate, locationsController.seedLocations);

router.get('/admin/sellers', authenticate, sellersController.adminGetSellers);
router.post('/admin/sellers/:id/verify', authenticate, sellersController.verifySeller);
router.post('/admin/sellers/:id/suspend', authenticate, sellersController.suspendSeller);

router.get('/admin/reports', authenticate, reportsController.getReports);
router.patch('/admin/reports/:id', authenticate, reportsController.updateReport);

router.get('/admin/memberships', authenticate, membershipController.adminGetMemberships);
router.get('/admin/membership-plans', authenticate, membershipController.adminGetPlans);
router.post('/admin/membership-plans', authenticate, membershipController.createPlan);
router.patch('/admin/membership-plans/:id', authenticate, membershipController.updatePlan);

router.get('/admin/promotions', authenticate, promotionsController.adminGetPromotions);
router.get('/admin/promotion-packages', authenticate, promotionsController.adminGetPackages);
router.post('/admin/promotion-packages', authenticate, promotionsController.createPackage);
router.patch('/admin/promotion-packages/:id', authenticate, promotionsController.updatePackage);

router.get('/admin/settings', authenticate, settingsController.getSettings);
router.patch('/admin/settings', authenticate, settingsController.updateSettings);

router.get('/admin/chat-moderation', authenticate, chatController.adminGetReportedChats);
router.post('/admin/chat-moderation/:id/block', authenticate, chatController.adminBlockConversation);

export default router;
