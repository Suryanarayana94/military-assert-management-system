import { Router } from 'express';
import { createAssignment, listAssignments } from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope, enforceBodyBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listAssignments);
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER'), enforceBodyBaseScope('baseId'), createAssignment);
export default router;
