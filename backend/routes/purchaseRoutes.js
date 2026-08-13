import { Router } from 'express';
import { createPurchase, listPurchases } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBodyBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listPurchases);
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBodyBaseScope('baseId'), createPurchase);
export default router;
