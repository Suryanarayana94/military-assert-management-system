import prisma from '../config/prisma.js';
import { decrementStock } from './assetController.js';
import { writeAuditLog } from '../services/auditService.js';
import { asPositiveInt } from '../utils/request.js';

const include = { base: true, equipmentType: true, createdBy: { select: { id: true, username: true } } };

export async function listAssignments(req, res, next) {
  try {
    const baseId = req.scopeBaseId || (req.query.baseId ? asPositiveInt(req.query.baseId, 'baseId') : undefined);
    const assignments = await prisma.assignment.findMany({ where: baseId ? { baseId } : undefined, include, orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ assignments });
  } catch (error) { return next(error); }
}

export async function createAssignment(req, res, next) {
  try {
    const baseId = asPositiveInt(req.body.baseId, 'baseId');
    const equipmentTypeId = asPositiveInt(req.body.equipmentTypeId, 'equipmentTypeId');
    const quantity = asPositiveInt(req.body.quantity, 'quantity');
    const assignee = String(req.body.assignee || '').trim();
    if (!assignee) return res.status(400).json({ message: 'An assignee is required.' });
    const assignment = await prisma.$transaction(async (tx) => {
      await decrementStock(tx, baseId, equipmentTypeId, quantity);
      const item = await tx.assignment.create({ data: { baseId, equipmentTypeId, quantity, assignee, createdById: req.user.id }, include });
      await writeAuditLog(tx, { userId: req.user.id, action: 'ASSIGNMENT', details: `Assigned ${quantity} × ${item.equipmentType.name} to ${assignee} at ${item.base.name}.` });
      return item;
    });
    return res.status(201).json({ assignment });
  } catch (error) { return next(error); }
}
