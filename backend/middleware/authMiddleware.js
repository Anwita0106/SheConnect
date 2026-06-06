const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'she_can_foundation_secret_key_2026';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Authorization header is missing.'
    });
  }

  // Expecting format: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Invalid authorization format. Use Bearer <token>.'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // Contains id and username
    next();
  } catch (error) {
    let message = 'Access denied. Invalid or expired token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again.';
    }
    
    return res.status(403).json({
      status: 'error',
      message
    });
  }
};

module.exports = verifyAdminToken;
