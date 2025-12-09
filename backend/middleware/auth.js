const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers.token;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'No token provided. Please login.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token. Please login again.' 
    });
  }
}

module.exports = authMiddleware;
