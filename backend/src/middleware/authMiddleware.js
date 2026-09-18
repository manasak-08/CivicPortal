const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const authenticateJWT = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return sendError(res, 401, 'Please login to continue. Authentication token missing.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'complaint_system_jwt_super_secret_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User account no longer exists or session expired.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired authentication token. Please login again.', error.message);
  }
};

module.exports = { authenticateJWT, requireAuth: authenticateJWT };