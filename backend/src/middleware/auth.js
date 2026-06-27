const { verifyToken, blacklistedTokens } = require('../utils/jwt');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided.'
      });
    }

    if (blacklistedTokens.has(token)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been invalidated. Please login again.'
      });
    }

    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'The user belonging to this token no longer exists or is suspended.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  restrictTo
};
