export function notFound(req, res) {
  return res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` });
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  if (error.code === 'P2003') return res.status(400).json({ message: 'A referenced base, user, or equipment type does not exist.' });
  return res.status(error.status || 500).json({ message: error.message || 'An unexpected server error occurred.' });
}
