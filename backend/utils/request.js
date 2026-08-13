export const asPositiveInt = (value, field) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${field} must be a positive whole number.`);
    error.status = 400;
    throw error;
  }
  return parsed;
};

export const dateRange = (query) => {
  const end = query.endDate ? new Date(query.endDate) : new Date();
  const start = query.startDate ? new Date(query.startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || start > end) {
    const error = new Error('Use a valid startDate and endDate range.');
    error.status = 400;
    throw error;
  }
  return { start, end };
};
