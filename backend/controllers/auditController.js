import prisma from '../config/prisma.js';

export async function listAuditLogs(req, res, next) {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: { user: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return res.json({ auditLogs });
  } catch (error) { return next(error); }
}
