import { Router } from 'express';
import { createTransfer, listTransfers } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listTransfers);
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createTransfer);
export default router;
