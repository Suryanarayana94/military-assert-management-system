import { Router } from 'express';
import { createExpenditure, listExpenditures } from '../controllers/expenditureController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBodyBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listExpenditures);
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER'), enforceBodyBaseScope('baseId'), createExpenditure);
export default router;
