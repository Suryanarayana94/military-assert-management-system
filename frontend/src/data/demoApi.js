const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();

const state = {
  bases: [
    { id: 1, name: 'Fort Alpha', location: 'Northern Command' },
    { id: 2, name: 'Fort Bravo', location: 'Eastern Command' },
    { id: 3, name: 'Camp Delta', location: 'Southern Command' }
  ],
  equipmentTypes: [
    { id: 1, name: 'M-ATV', category: 'VEHICLE' },
    { id: 2, name: 'M4 Carbine', category: 'WEAPON' },
    { id: 3, name: 'Tactical Radio', category: 'WEAPON' },
    { id: 4, name: '5.56mm Ammunition', category: 'AMMUNITION' }
  ],
  users: [
    { id: 1, username: 'admin_user', password: 'AdminPass123!', role: 'ADMIN', baseId: null },
    { id: 2, username: 'commander_alpha', password: 'CommandPass123!', role: 'BASE_COMMANDER', baseId: 1 },
    { id: 3, username: 'logistics_officer', password: 'LogisticsPass123!', role: 'LOGISTICS_OFFICER', baseId: 1 }
  ],
  assets: [
    { baseId: 1, equipmentTypeId: 1, quantity: 28 }, { baseId: 2, equipmentTypeId: 1, quantity: 12 },
    { baseId: 1, equipmentTypeId: 2, quantity: 650 }, { baseId: 1, equipmentTypeId: 3, quantity: 16 },
    { baseId: 1, equipmentTypeId: 4, quantity: 12000 }, { baseId: 2, equipmentTypeId: 4, quantity: 3760 },
    { baseId: 3, equipmentTypeId: 4, quantity: 5000 }
  ],
  purchases: [
    { id: 1, baseId: 1, equipmentTypeId: 1, quantity: 40, createdById: 3, createdAt: daysAgo(45) },
    { id: 2, baseId: 1, equipmentTypeId: 2, quantity: 650, createdById: 3, createdAt: daysAgo(44) },
    { id: 3, baseId: 1, equipmentTypeId: 3, quantity: 64, createdById: 3, createdAt: daysAgo(25) },
    { id: 4, baseId: 1, equipmentTypeId: 4, quantity: 12000, createdById: 3, createdAt: daysAgo(42) },
    { id: 5, baseId: 2, equipmentTypeId: 4, quantity: 5000, createdById: 3, createdAt: daysAgo(18) },
    { id: 6, baseId: 3, equipmentTypeId: 4, quantity: 5000, createdById: 3, createdAt: daysAgo(1) }
  ],
  transfers: [{ id: 1, sourceBaseId: 1, destinationBaseId: 2, equipmentTypeId: 1, quantity: 12, initiatedById: 3, status: 'COMPLETED', createdAt: daysAgo(1) }],
  assignments: [{ id: 1, baseId: 1, equipmentTypeId: 3, quantity: 48, assignee: '3rd Brigade', createdById: 2, createdAt: daysAgo(3) }],
  expenditures: [{ id: 1, baseId: 2, equipmentTypeId: 4, quantity: 1240, reason: 'Training exercise', createdById: 1, createdAt: daysAgo(5) }],
  auditLogs: [
    { id: 1, userId: 3, action: 'TRANSFER', details: 'Transferred 12 × M-ATV from Fort Alpha to Fort Bravo.', createdAt: daysAgo(1) },
    { id: 2, userId: 2, action: 'ASSIGNMENT', details: 'Assigned 48 × Tactical Radio to 3rd Brigade at Fort Alpha.', createdAt: daysAgo(3) },
    { id: 3, userId: 1, action: 'EXPENDITURE', details: 'Recorded 1,240 × 5.56mm Ammunition as expended at Fort Bravo: Training exercise.', createdAt: daysAgo(5) },
    { id: 4, userId: 3, action: 'PURCHASE', details: 'Received 5,000 × 5.56mm Ammunition at Camp Delta.', createdAt: daysAgo(1) }
  ]
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const nextId = (items) => Math.max(0, ...items.map((item) => item.id)) + 1;
const lookup = (list, id) => list.find((item) => item.id === Number(id));
const withDetails = (item, kind) => {
  const userId = item.createdById || item.initiatedById;
  const result = { ...item, equipmentType: lookup(state.equipmentTypes, item.equipmentTypeId), createdBy: lookup(state.users, userId) };
  if (item.baseId) result.base = lookup(state.bases, item.baseId);
  if (kind === 'transfer') { result.sourceBase = lookup(state.bases, item.sourceBaseId); result.destinationBase = lookup(state.bases, item.destinationBaseId); result.initiatedBy = lookup(state.users, item.initiatedById); }
  return result;
};
const scopedBase = (user, baseId) => user.role === 'BASE_COMMANDER' ? user.baseId : Number(baseId) || undefined;
const allowed = (user, roles) => { if (!roles.includes(user.role)) throw new Error('Access denied: insufficient authorization level.'); };
const ensureBase = (user, baseId) => { const target = scopedBase(user, baseId); if (!lookup(state.bases, target)) throw new Error('A valid base is required.'); return target; };
const amount = (value, field = 'quantity') => { const parsed = Number(value); if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${field} must be a positive whole number.`); return parsed; };
const updateAsset = (baseId, equipmentTypeId, delta) => {
  const asset = state.assets.find((item) => item.baseId === Number(baseId) && item.equipmentTypeId === Number(equipmentTypeId));
  if (!asset && delta < 0) throw new Error('Insufficient available stock for this operation.');
  if (asset && asset.quantity + delta < 0) throw new Error('Insufficient available stock for this operation.');
  if (asset) asset.quantity += delta; else state.assets.push({ baseId: Number(baseId), equipmentTypeId: Number(equipmentTypeId), quantity: delta });
};
const audit = (user, action, details) => state.auditLogs.unshift({ id: nextId(state.auditLogs), userId: user.id, action, details, createdAt: new Date().toISOString() });
const matchEquipment = (item, equipmentTypeId) => !equipmentTypeId || item.equipmentTypeId === Number(equipmentTypeId);
const matchesDate = (item, start, end) => (!start || new Date(item.createdAt) >= new Date(start)) && (!end || new Date(item.createdAt) <= new Date(end));
const sum = (items) => items.reduce((total, item) => total + item.quantity, 0);

export const demoApi = {
  login: async ({ username, password }) => {
    const user = state.users.find((entry) => entry.username === username && entry.password === password);
    if (!user) throw new Error('Invalid username or password.');
    return { token: `demo-token-${user.id}`, user: { ...user, password: undefined, base: user.baseId ? lookup(state.bases, user.baseId) : null } };
  },
  reference: async (user) => ({ bases: state.bases.filter((base) => !user.baseId || user.role !== 'BASE_COMMANDER' || base.id === user.baseId), equipmentTypes: state.equipmentTypes }),
  dashboard: async (user, query = {}) => {
    const baseId = scopedBase(user, query.baseId); const equipmentTypeId = Number(query.equipmentTypeId) || undefined;
    const end = query.endDate || new Date().toISOString(); const start = query.startDate || daysAgo(30);
    const selected = (item, baseField = 'baseId') => (!baseId || item[baseField] === baseId) && matchEquipment(item, equipmentTypeId);
    const prior = (items, field) => sum(items.filter((item) => selected(item, field) && new Date(item.createdAt) < new Date(start)));
    const period = (items, field) => sum(items.filter((item) => selected(item, field) && matchesDate(item, start, end)));
    const opening = prior(state.purchases) + prior(state.transfers, 'destinationBaseId') - prior(state.transfers, 'sourceBaseId') - prior(state.assignments) - prior(state.expenditures);
    const purchases = period(state.purchases), transfersIn = period(state.transfers, 'destinationBaseId'), transfersOut = period(state.transfers, 'sourceBaseId'), assigned = period(state.assignments), expended = period(state.expenditures);
    return { period: { start, end }, openingBalance: opening, purchases, transfersIn, transfersOut, assigned, expended, netMovement: purchases + transfersIn - transfersOut, closingBalance: opening + purchases + transfersIn - transfersOut - assigned - expended };
  },
  inventory: async (user, query = {}) => {
    const baseId = scopedBase(user, query.baseId); const equipmentTypeId = Number(query.equipmentTypeId) || undefined;
    return { assets: state.assets.filter((item) => (!baseId || item.baseId === baseId) && matchEquipment(item, equipmentTypeId)).map((item) => ({ ...item, base: lookup(state.bases, item.baseId), equipmentType: lookup(state.equipmentTypes, item.equipmentTypeId) })) };
  },
  purchases: async (user, query = {}) => ({ purchases: state.purchases.filter((item) => { const baseId = scopedBase(user, query.baseId); return !baseId || item.baseId === baseId; }).map((item) => withDetails(item)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }),
  createPurchase: async (user, data) => {
    allowed(user, ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']); const baseId = ensureBase(user, data.baseId); const quantity = amount(data.quantity); const equipment = lookup(state.equipmentTypes, Number(data.equipmentTypeId)); if (!equipment) throw new Error('A valid equipment type is required.');
    const item = { id: nextId(state.purchases), baseId, equipmentTypeId: equipment.id, quantity, createdById: user.id, createdAt: new Date().toISOString() }; state.purchases.unshift(item); updateAsset(baseId, equipment.id, quantity); audit(user, 'PURCHASE', `Received ${quantity} × ${equipment.name} at ${lookup(state.bases, baseId).name}.`); return { purchase: withDetails(item) };
  },
  transfers: async (user, query = {}) => ({ transfers: state.transfers.filter((item) => { const baseId = scopedBase(user, query.baseId); return !baseId || item.sourceBaseId === baseId || item.destinationBaseId === baseId; }).map((item) => withDetails(item, 'transfer')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }),
  createTransfer: async (user, data) => {
    allowed(user, ['ADMIN', 'LOGISTICS_OFFICER']); const sourceBaseId = ensureBase(user, data.sourceBaseId); const destinationBaseId = ensureBase({ ...user, role: 'ADMIN' }, data.destinationBaseId); const quantity = amount(data.quantity); const equipment = lookup(state.equipmentTypes, Number(data.equipmentTypeId)); if (!equipment || sourceBaseId === destinationBaseId) throw new Error('Use valid, different bases and equipment.');
    updateAsset(sourceBaseId, equipment.id, -quantity); updateAsset(destinationBaseId, equipment.id, quantity); const item = { id: nextId(state.transfers), sourceBaseId, destinationBaseId, equipmentTypeId: equipment.id, quantity, initiatedById: user.id, status: 'COMPLETED', createdAt: new Date().toISOString() }; state.transfers.unshift(item); audit(user, 'TRANSFER', `Transferred ${quantity} × ${equipment.name} from ${lookup(state.bases, sourceBaseId).name} to ${lookup(state.bases, destinationBaseId).name}.`); return { transfer: withDetails(item, 'transfer') };
  },
  assignments: async (user, query = {}) => ({ assignments: state.assignments.filter((item) => { const baseId = scopedBase(user, query.baseId); return !baseId || item.baseId === baseId; }).map((item) => withDetails(item)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }),
  createAssignment: async (user, data) => {
    allowed(user, ['ADMIN', 'BASE_COMMANDER']); const baseId = ensureBase(user, data.baseId); const quantity = amount(data.quantity); const assignee = String(data.assignee || '').trim(); const equipment = lookup(state.equipmentTypes, Number(data.equipmentTypeId)); if (!assignee || !equipment) throw new Error('Assignee and equipment type are required.');
    updateAsset(baseId, equipment.id, -quantity); const item = { id: nextId(state.assignments), baseId, equipmentTypeId: equipment.id, quantity, assignee, createdById: user.id, createdAt: new Date().toISOString() }; state.assignments.unshift(item); audit(user, 'ASSIGNMENT', `Assigned ${quantity} × ${equipment.name} to ${assignee} at ${lookup(state.bases, baseId).name}.`); return { assignment: withDetails(item) };
  },
  expenditures: async (user, query = {}) => ({ expenditures: state.expenditures.filter((item) => { const baseId = scopedBase(user, query.baseId); return !baseId || item.baseId === baseId; }).map((item) => withDetails(item)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }),
  createExpenditure: async (user, data) => {
    allowed(user, ['ADMIN', 'BASE_COMMANDER']); const baseId = ensureBase(user, data.baseId); const quantity = amount(data.quantity); const reason = String(data.reason || '').trim(); const equipment = lookup(state.equipmentTypes, Number(data.equipmentTypeId)); if (!reason || !equipment) throw new Error('Reason and equipment type are required.');
    updateAsset(baseId, equipment.id, -quantity); const item = { id: nextId(state.expenditures), baseId, equipmentTypeId: equipment.id, quantity, reason, createdById: user.id, createdAt: new Date().toISOString() }; state.expenditures.unshift(item); audit(user, 'EXPENDITURE', `Recorded ${quantity} × ${equipment.name} as expended at ${lookup(state.bases, baseId).name}: ${reason}.`); return { expenditure: withDetails(item) };
  },
  audit: async (user) => { allowed(user, ['ADMIN']); return { auditLogs: state.auditLogs.map((item) => ({ ...item, user: lookup(state.users, item.userId) })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }; }
};
