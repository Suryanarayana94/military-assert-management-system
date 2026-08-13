import prisma from '../config/prisma.js';
import { decrementStock, incrementStock } from './assetController.js';
import { writeAuditLog } from '../services/auditService.js';
import { asPositiveInt } from '../utils/request.js';

const include = { sourceBase: true, destinationBase: true, equipmentType: true, initiatedBy: { select: { id: true, username: true } } };

export async function listTransfers(req, res, next) {
  try {
    const baseId = req.scopeBaseId || (req.query.baseId ? asPositiveInt(req.query.baseId, 'baseId') : undefined);
    const where = baseId ? { OR: [{ sourceBaseId: baseId }, { destinationBaseId: baseId }] } : undefined;
    const transfers = await prisma.transfer.findMany({ where, include, orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json({ transfers });
  } catch (error) { return next(error); }
}

export async function createTransfer(req, res, next) {
  try {
    const sourceBaseId = asPositiveInt(req.body.sourceBaseId, 'sourceBaseId');
    const destinationBaseId = asPositiveInt(req.body.destinationBaseId, 'destinationBaseId');
    const equipmentTypeId = asPositiveInt(req.body.equipmentTypeId, 'equipmentTypeId');
    const quantity = asPositiveInt(req.body.quantity, 'quantity');
    if (sourceBaseId === destinationBaseId) return res.status(400).json({ message: 'Source and destination bases must differ.' });

    const transfer = await prisma.$transaction(async (tx) => {
      await decrementStock(tx, sourceBaseId, equipmentTypeId, quantity);
      await incrementStock(tx, destinationBaseId, equipmentTypeId, quantity);
      const item = await tx.transfer.create({ data: { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, initiatedById: req.user.id, status: 'COMPLETED' }, include });
      await writeAuditLog(tx, { userId: req.user.id, action: 'TRANSFER', details: `Transferred ${quantity} × ${item.equipmentType.name} from ${item.sourceBase.name} to ${item.destinationBase.name}.` });
      return item;
    }, { isolationLevel: 'Serializable' });
    return res.status(201).json({ transfer });
  } catch (error) { return next(error); }
}
