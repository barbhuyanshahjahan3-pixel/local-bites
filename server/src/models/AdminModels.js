const mongoose = require('mongoose');
const { staffAccountFields } = require('./schemaHelpers');

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true }, // e.g. LB-ADM-003
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin', required: true },
    ...staffAccountFields,
  },
  { timestamps: true }
);

const superAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    ...staffAccountFields,
  },
  { timestamps: true }
);

// Guard: only ever one SuperAdmin document is expected in normal operation.
// Enforced at the application layer (superAdminController) since Mongo can't
// natively cap a collection to 1 document with validation logic attached.

const Admin = mongoose.model('Admin', adminSchema);
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = { Admin, SuperAdmin };
