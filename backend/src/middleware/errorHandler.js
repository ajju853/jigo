const errorHandler = (err, req, res, next) => {
  // Log error stack for debugging
  console.error('💥 Error Stack:', err.stack || err);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma unique constraint error code
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Unique constraint violation',
      message: `The unique field '${err.meta?.target?.join(', ')}' already exists.`
    });
  }

  // Prisma record not found error code
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'The requested record could not be found.'
    });
  }

  // JWT validation errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization token has expired.'
    });
  }

  res.status(statusCode).json({
    error: err.error || 'Server Error',
    message
  });
};

module.exports = errorHandler;
