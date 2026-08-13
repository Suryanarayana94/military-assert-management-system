export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient authorization level.' });
  }
  return next();
};

export const enforceBaseScope = (req, res, next) => {
  if (req.user?.role === 'BASE_COMMANDER') {
    req.scopeBaseId = req.user.baseId;
    req.query.baseId = String(req.user.baseId);
  }
  return next();
};

export const enforceBodyBaseScope = (...fields) => (req, res, next) => {
  if (req.user?.role !== 'BASE_COMMANDER') return next();
  for (const field of fields) {
    if (req.body[field] !== undefined && Number(req.body[field]) !== req.user.baseId) {
      return res.status(403).json({ message: 'Base Commanders can only manage assets assigned to their base.' });
    }
    req.body[field] = req.user.baseId;
  }
  return next();
};
