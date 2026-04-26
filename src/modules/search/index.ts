import { Router } from 'express';
import * as SearchController from './controller';
import * as AdminSearchController from './admin.controller';
import { visualSearch } from './visual.controller';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = Router();

// Public Routes
router.get('/', SearchController.globalSearch);
router.post('/visual', upload.single('image'), visualSearch);

// Admin Routes (Should be protected by admin middleware in production)
router.get('/admin/health', AdminSearchController.getSearchHealth);
router.post('/admin/reindex', AdminSearchController.reindexAll);
router.get('/admin/logs', AdminSearchController.getSearchLogs);
router.get('/admin/popular', AdminSearchController.getPopularTerms);
router.get('/admin/no-results', AdminSearchController.getNoResultSearches);

export default router;
