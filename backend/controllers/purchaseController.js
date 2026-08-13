import prisma from '../config/prisma.js';
import { incrementStock } from './assetController.js';
import { writeAuditLog } from '../services/auditService.js';
import { asPositiveInt } from '../utils/request.js';

const include = { base: true, equipmentType: true, createdBy: { select: { id: true, username: true } } };

export async function listPurchases(req, res, next) {
  try {
    const baseId = req.scopeBaseId || (req.query.baseId ? asPositiveInt(req.query.baseId, 'baseId') : undefined);
    const purchases = await prisma.purchase.findMany({ where: baseId ? { baseId } : undefined, include, orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ purchases });
  } catch (error) { return next(error); }
}

export async function createPurchase(req, res, next) {
  try {
    const baseId = asPositiveInt(req.body.baseId, 'baseId');
    const equipmentTypeId = asPositiveInt(req.body.equipmentTypeId, 'equipmentTypeId');
    const quantity = asPositiveInt(req.body.quantity, 'quantity');
    const purchase = await prisma.$transaction(async (tx) => {
      const item = await tx.purchase.create({ data: { baseId, equipmentTypeId, quantity, createdById: req.user.id }, include });
      await incrementStock(tx, baseId, equipmentTypeId, quantity);
      await writeAuditLog(tx, { userId: req.user.id, action: 'PURCHASE', details: `Received ${quantity} × ${item.equipmentType.name} at ${item.base.name}.` });
      return item;
    });
    return res.status(201).json({ purchase });
  } catch (error) { return next(error); }
}
