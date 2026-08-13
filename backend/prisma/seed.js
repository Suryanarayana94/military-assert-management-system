import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function addStock(baseId, equipmentTypeId, quantity) {
  await prisma.asset.upsert({
    where: { baseId_equipmentTypeId: { baseId, equipmentTypeId } },
    create: { baseId, equipmentTypeId, quantity },
    update: { quantity: { increment: quantity } }
  });
}

async function removeStock(baseId, equipmentTypeId, quantity) {
  await prisma.asset.update({
    where: { baseId_equipmentTypeId: { baseId, equipmentTypeId } },
    data: { quantity: { decrement: quantity } }
  });
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.base.deleteMany();

  const [alpha, bravo, delta] = await Promise.all([
    prisma.base.create({ data: { name: 'Fort Alpha', location: 'Northern Command' } }),
    prisma.base.create({ data: { name: 'Fort Bravo', location: 'Eastern Command' } }),
    prisma.base.create({ data: { name: 'Camp Delta', location: 'Southern Command' } })
  ]);
  const [matv, carbine, radio, ammo] = await Promise.all([
    prisma.equipmentType.create({ data: { name: 'M-ATV', category: 'VEHICLE' } }),
    prisma.equipmentType.create({ data: { name: 'M4 Carbine', category: 'WEAPON' } }),
    prisma.equipmentType.create({ data: { name: 'Tactical Radio', category: 'WEAPON' } }),
    prisma.equipmentType.create({ data: { name: '5.56mm Ammunition', category: 'AMMUNITION' } })
  ]);
  const [adminHash, commanderHash, logisticsHash] = await Promise.all([
    bcrypt.hash('AdminPass123!', 12),
    bcrypt.hash('CommandPass123!', 12),
    bcrypt.hash('LogisticsPass123!', 12)
  ]);
  const admin = await prisma.user.create({ data: { username: 'admin_user', passwordHash: adminHash, role: 'ADMIN' } });
  const commander = await prisma.user.create({ data: { username: 'commander_alpha', passwordHash: commanderHash, role: 'BASE_COMMANDER', baseId: alpha.id } });
  const logistics = await prisma.user.create({ data: { username: 'logistics_officer', passwordHash: logisticsHash, role: 'LOGISTICS_OFFICER', baseId: alpha.id } });

  const purchase = async (base, equipment, quantity, user, days) => {
    const item = await prisma.purchase.create({ data: { baseId: base.id, equipmentTypeId: equipment.id, quantity, createdById: user.id, createdAt: daysAgo(days) } });
    await addStock(base.id, equipment.id, quantity);
    await prisma.auditLog.create({ data: { userId: user.id, action: 'PURCHASE', details: `Received ${quantity} × ${equipment.name} at ${base.name}.`, createdAt: item.createdAt } });
  };
  await purchase(alpha, matv, 40, logistics, 45);
  await purchase(alpha, carbine, 650, logistics, 44);
  await purchase(alpha, radio, 64, logistics, 25);
  await purchase(alpha, ammo, 12000, logistics, 42);
  await purchase(bravo, ammo, 5000, logistics, 18);
  await purchase(delta, ammo, 5000, logistics, 1);

  const transferDate = daysAgo(1);
  await removeStock(alpha.id, matv.id, 12);
  await addStock(bravo.id, matv.id, 12);
  await prisma.transfer.create({ data: { sourceBaseId: alpha.id, destinationBaseId: bravo.id, equipmentTypeId: matv.id, quantity: 12, initiatedById: logistics.id, status: 'COMPLETED', createdAt: transferDate } });
  await prisma.auditLog.create({ data: { userId: logistics.id, action: 'TRANSFER', details: 'Transferred 12 × M-ATV from Fort Alpha to Fort Bravo.', createdAt: transferDate } });

  const assignmentDate = daysAgo(3);
  await removeStock(alpha.id, radio.id, 48);
  await prisma.assignment.create({ data: { baseId: alpha.id, equipmentTypeId: radio.id, quantity: 48, assignee: '3rd Brigade', createdById: commander.id, createdAt: assignmentDate } });
  await prisma.auditLog.create({ data: { userId: commander.id, action: 'ASSIGNMENT', details: 'Assigned 48 × Tactical Radio to 3rd Brigade at Fort Alpha.', createdAt: assignmentDate } });

  const expenseDate = daysAgo(5);
  await removeStock(bravo.id, ammo.id, 1240);
  await prisma.expenditure.create({ data: { baseId: bravo.id, equipmentTypeId: ammo.id, quantity: 1240, reason: 'Training exercise', createdById: admin.id, createdAt: expenseDate } });
  await prisma.auditLog.create({ data: { userId: admin.id, action: 'EXPENDITURE', details: 'Recorded 1,240 × 5.56mm Ammunition as expended at Fort Bravo: Training exercise.', createdAt: expenseDate } });

  console.log('Seeded Sentinel database with sample accounts and transaction history.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
