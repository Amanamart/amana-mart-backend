import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

dotenv.config();

const app = express();

import { prisma } from './common/lib/prisma';

const PORT = process.env.PORT || 5000;

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

app.use(cors({
  origin: [...corsOrigins, /\.vercel\.app$/],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import { languageMiddleware } from './middleware/language';
app.use(languageMiddleware);

// Static files
import path from 'path';
import fs from 'fs';
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Comprehensive Health check
import { getHealthReport } from './common/lib/health';
app.get('/api/health', async (req, res) => {
  try {
    const report = await getHealthReport();
    const httpStatus = report.status === 'unhealthy' ? 503 : 200;
    res.status(httpStatus).json(report);
  } catch (e: any) {
    res.status(503).json({ status: 'unhealthy', message: e.message });
  }
});
// Legacy health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Import routes
import authRoutes from './auth/routes';
import zoneRoutes from './zones/routes';
import moduleRoutes from './modules/core/routes';
import adminRoutes from './admin/routes';
import storeRoutes from './stores/routes';
import orderRoutes from './orders/routes';
import riderRoutes from './riders/routes';
import categoryRoutes from './categories/routes';
import messagingRoutes from './messaging/routes';
import mediaRoutes from './media/routes';
import whatsappRoutes from './whatsapp/routes';

// Super App Modules
import classifiedRoutes from './modules/classified/index';
import rideShareRoutes from './modules/ride-share/index';
import parcelRoutes from './modules/parcel/parcel.controller';
import serviceRoutes from './modules/services/services.controller';
import affiliateRoutes from './modules/affiliate/affiliate.controller';
import searchRoutes from './modules/search/index';
import groceryRoutes from './modules/grocery/routes';
import pharmacyRoutes from './modules/pharmacy/routes';
import foodRoutes from './modules/food/routes';
import shopRoutes from './modules/shop/routes';

// Register Core APIs
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/media', mediaRoutes);

// Register Super App Modules
app.use('/api/search', searchRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/classified', classifiedRoutes);
app.use('/api/ride-share', rideShareRoutes);
app.use('/api/parcel', parcelRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/affiliate', affiliateRoutes);

app.use('/api/webhooks/whatsapp', whatsappRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

export default app;
export { prisma };

import { initMeilisearch } from './modules/search/meilisearch.client';
import { startSearchIndexWorker } from './jobs/search-index.worker';
import { initSocket } from './common/lib/socket';

const httpServer = createServer(app);

const startServer = async () => {
  // Initialize Meilisearch
  await initMeilisearch().catch(err => console.error('Failed to initialize Meilisearch:', err));
  
  // Start Background Workers
  startSearchIndexWorker().catch(err => console.error('Failed to start Search Index worker:', err));

  // Initialize Socket.io
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Amana Mart Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.io initialized`);
  });
};

startServer();
