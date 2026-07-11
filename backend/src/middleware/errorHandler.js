const ApiError = require('../utils/ApiError');

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  const errors = err.errors || [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors.push(...Object.values(err.errors).map((e) => e.message));
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  if (process.env.NODE_ENV === 'development') console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (_req, _res, next) => next(new ApiError(404, 'Route not found'));

module.exports = { errorHandler, notFound };
