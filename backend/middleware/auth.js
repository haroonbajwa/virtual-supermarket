const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};

module.exports = { auth, requireRole };
