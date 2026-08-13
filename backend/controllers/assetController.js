import prisma from '../config/prisma.js';
import { asPositiveInt, dateRange } from '../utils/request.js';

const number = (result) => result?._sum?.quantity || 0;

function optionalId(value, label) {
  if (value === undefined || value === null || value === '') return undefined;
  return asPositiveInt(value, label);
}

function scope(req) {
  return req.scopeBaseId || optionalId(req.query.baseId, 'baseId');
}

export async function getReferenceData(req, res, next) {
  try {
    const baseId = req.scopeBaseId;
    const [bases, equipmentTypes] = await Promise.all([
      prisma.base.findMany({ where: baseId ? { id: baseId } : undefined, orderBy: { name: 'asc' } }),
      prisma.equipmentType.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
    ]);
    return res.json({ bases, equipmentTypes });
  } catch (error) {
    return next(error);
  }
}

export async function getInventory(req, res, next) {
  try {
    const baseId = scope(req);
    const equipmentTypeId = optionalId(req.query.equipmentTypeId, 'equipmentTypeId');
    const assets = await prisma.asset.findMany({
      where: { ...(baseId && { baseId }), ...(equipmentTypeId && { equipmentTypeId }) },
      include: { base: true, equipmentType: true },
      orderBy: [{ base: { name: 'asc' } }, { equipmentType: { name: 'asc' } }]
    });
    return res.json({ assets });
  } catch (error) {
    return next(error);
  }
}

export async function getDashboardMetrics(req, res, next) {
  try {
    const baseId = scope(req);
    const equipmentTypeId = optionalId(req.query.equipmentTypeId, 'equipmentTypeId');
    const { start, end } = dateRange(req.query);
    const baseFilter = baseId ? { baseId } : {};
    const equipmentFilter = equipmentTypeId ? { equipmentTypeId } : {};
    const before = { createdAt: { lt: start } };
    const period = { createdAt: { gte: start, lte: end } };
    const purchaseWhere = (range) => ({ ...baseFilter, ...equipmentFilter, ...range });
    const assignmentWhere = (range) => ({ ...baseFilter, ...equipmentFilter, ...range });
    const transferInWhere = (range) => ({ status: 'COMPLETED', ...(baseId && { destinationBaseId: baseId }), ...equipmentFilter, ...range });
    const transferOutWhere = (range) => ({ status: 'COMPLETED', ...(baseId && { sourceBaseId: baseId }), ...equipmentFilter, ...range });

    const sums = await Promise.all([
      prisma.purchase.aggregate({ where: purchaseWhere(before), _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferInWhere(before), _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferOutWhere(before), _sum: { quantity: true } }),
      prisma.assignment.aggregate({ where: assignmentWhere(before), _sum: { quantity: true } }),
      prisma.expenditure.aggregate({ where: assignmentWhere(before), _sum: { quantity: true } }),
      prisma.purchase.aggregate({ where: purchaseWhere(period), _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferInWhere(period), _sum: { quantity: true } }),
      prisma.transfer.aggregate({ where: transferOutWhere(period), _sum: { quantity: true } }),
      prisma.assignment.aggregate({ where: assignmentWhere(period), _sum: { quantity: true } }),
      prisma.expenditure.aggregate({ where: assignmentWhere(period), _sum: { quantity: true } })
    ]);
    const [priorPurchases, priorIn, priorOut, priorAssigned, priorExpended, purchases, transfersIn, transfersOut, assigned, expended] = sums.map(number);
    const openingBalance = priorPurchases + priorIn - priorOut - priorAssigned - priorExpended;
    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = openingBalance + netMovement - assigned - expended;

    return res.json({
      period: { start, end },
      openingBalance,
      purchases,
      transfersIn,
      transfersOut,
      assigned,
      expended,
      netMovement,
      closingBalance
    });
  } catch (error) {
    return next(error);
  }
}

export async function decrementStock(tx, baseId, equipmentTypeId, quantity) {
  const update = await tx.asset.updateMany({
    where: { baseId, equipmentTypeId, quantity: { gte: quantity } },
    data: { quantity: { decrement: quantity } }
  });
  if (update.count !== 1) {
    const error = new Error('Insufficient available stock for this operation.');
    error.status = 409;
    throw error;
  }
}

export async function incrementStock(tx, baseId, equipmentTypeId, quantity) {
  return tx.asset.upsert({
    where: { baseId_equipmentTypeId: { baseId, equipmentTypeId } },
    create: { baseId, equipmentTypeId, quantity },
    update: { quantity: { increment: quantity } }
  });
}
