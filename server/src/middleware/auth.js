const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/authUtils');

// Every signed token carries { id, role }. role is one of:
// 'customer' | 'restaurant' | 'delivery_partner' | 'admin' | 'super_admin'
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  try {
    const decoded = verifyToken(header.split(' ')[1]);
    req.user = decoded; // { id, role, mustChangePassword? }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

// Usage: allowRoles('admin', 'super_admin')
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Forbidden: insufficient role');
  }
  next();
};

// Staff accounts must change their temp password before doing anything else.
const blockIfMustChangePassword = (req, res, next) => {
  if (req.user?.mustChangePassword) {
    res.status(403);
    throw new Error('Password change required before continuing');
  }
  next();
};

module.exports = { protect, allowRoles, blockIfMustChangePassword };
