export async function writeAuditLog(db, { userId, action, details }) {
  return db.auditLog.create({ data: { userId, action, details } });
}
