import { Router } from 'express';
import { getDashboardMetrics, getInventory, getReferenceData } from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/dashboard', getDashboardMetrics);
router.get('/assets', getInventory);
router.get('/reference', getReferenceData);
export default router;
