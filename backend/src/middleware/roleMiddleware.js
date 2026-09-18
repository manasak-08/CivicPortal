const { sendError } = require('../utils/responseHandler');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      if (roles.includes('admin') && !roles.includes('staff')) {
        return sendError(res, 403, 'Only administrators can access this page.');
      }
      return sendError(res, 403, `Access forbidden for role: ${req.user.role}.`);
    }

    next();
  };
};

const requireCitizen = authorizeRoles('citizen');
const requireStaff = authorizeRoles('staff');
const requireAdmin = authorizeRoles('admin');

module.exports = {
  authorizeRoles,
  requireCitizen,
  requireStaff,
  requireAdmin
};