const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const DeliveryPartner = require('../models/DeliveryPartner');
const { Admin, SuperAdmin } = require('../models/AdminModels');
const Customer = require('../models/Customer');
const { signToken, comparePassword, hashPassword } = require('../utils/authUtils');

const MODEL_BY_ROLE = {
  restaurant: Restaurant,
  delivery_partner: DeliveryPartner,
  admin: Admin,
  super_admin: SuperAdmin,
};

// POST /api/auth/staff-login  { role, accessCode, password }
// Shared login for restaurant / delivery_partner / admin / super_admin —
// all of them authenticate with an accessCode + password, never self-registered.
const staffLogin = asyncHandler(async (req, res) => {
  const { role, accessCode, password } = req.body;
  const Model = MODEL_BY_ROLE[role];
  if (!Model) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const account = await Model.findOne({ accessCode });
  if (!account || account.isDisabled) {
    res.status(401);
    throw new Error('Invalid access code or account disabled');
  }

  const ok = await comparePassword(password, account.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  account.lastLoginAt = new Date();
  await account.save();

  const token = signToken({
    id: account._id,
    role,
    mustChangePassword: account.mustChangePassword,
  });

  res.json({
    success: true,
    token,
    mustChangePassword: account.mustChangePassword,
    profile: {
      id: account._id,
      name: account.name,
      accessCode: account.accessCode,
      city: account.city || null,
    },
  });
});

// POST /api/auth/change-password  (staff, requires valid token even if mustChangePassword=true)
const changeStaffPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const Model = MODEL_BY_ROLE[req.user.role];
  if (!Model) {
    res.status(400);
    throw new Error('Invalid role');
  }
  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  const account = await Model.findById(req.user.id);
  account.passwordHash = await hashPassword(newPassword);
  account.mustChangePassword = false;
  await account.save();

  const token = signToken({ id: account._id, role: req.user.role, mustChangePassword: false });
  res.json({ success: true, token });
});

// POST /api/auth/customer/register  { name, mobile, email? }
// Customers self-register — no access code needed, mobile-first flow (OTP verification
// hook goes here; stubbed as instant-verify for this reference implementation).
const customerRegister = asyncHandler(async (req, res) => {
  const { name, mobile, email } = req.body;
  if (!name || !mobile) {
    res.status(400);
    throw new Error('Name and mobile are required');
  }
  let customer = await Customer.findOne({ mobile });
  if (!customer) {
    customer = await Customer.create({ name, mobile, email });
  }
  const token = signToken({ id: customer._id, role: 'customer' });
  res.json({ success: true, token, profile: { id: customer._id, name: customer.name } });
});

module.exports = { staffLogin, changeStaffPassword, customerRegister };
