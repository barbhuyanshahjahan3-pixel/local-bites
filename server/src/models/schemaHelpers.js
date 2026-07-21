const mongoose = require('mongoose');

// Fields shared by every staff-side account (Restaurant, DeliveryPartner, Admin, SuperAdmin).
// These accounts are never self-registered — see controllers/superAdminController.js /
// adminController.js for creation logic.
const staffAccountFields = {
  accessCode: { type: String, required: true, unique: true }, // human-shown secure ID, e.g. RB-HJ-0007
  passwordHash: { type: String, required: true },
  mustChangePassword: { type: Boolean, default: true },
  isDisabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null },
};

module.exports = { staffAccountFields };
