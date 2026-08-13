import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.get('/', authenticateToken, authorizeRoles('ADMIN'), listAuditLogs);
export default router;
