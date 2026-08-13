import prisma from '../config/prisma.js';
import { decrementStock } from './assetController.js';
import { writeAuditLog } from '../services/auditService.js';
import { asPositiveInt } from '../utils/request.js';

const include = { base: true, equipmentType: true, createdBy: { select: { id: true, username: true } } };

export async function listExpenditures(req, res, next) {
  try {
    const baseId = req.scopeBaseId || (req.query.baseId ? asPositiveInt(req.query.baseId, 'baseId') : undefined);
    const expenditures = await prisma.expenditure.findMany({ where: baseId ? { baseId } : undefined, include, orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ expenditures });
  } catch (error) { return next(error); }
}

export async function createExpenditure(req, res, next) {
  try {
    const baseId = asPositiveInt(req.body.baseId, 'baseId');
    const equipmentTypeId = asPositiveInt(req.body.equipmentTypeId, 'equipmentTypeId');
    const quantity = asPositiveInt(req.body.quantity, 'quantity');
    const reason = String(req.body.reason || '').trim();
    if (!reason) return res.status(400).json({ message: 'An expenditure reason is required.' });
    const expenditure = await prisma.$transaction(async (tx) => {
      await decrementStock(tx, baseId, equipmentTypeId, quantity);
      const item = await tx.expenditure.create({ data: { baseId, equipmentTypeId, quantity, reason, createdById: req.user.id }, include });
      await writeAuditLog(tx, { userId: req.user.id, action: 'EXPENDITURE', details: `Recorded ${quantity} × ${item.equipmentType.name} as expended at ${item.base.name}: ${reason}.` });
      return item;
    });
    return res.status(201).json({ expenditure });
  } catch (error) { return next(error); }
}
