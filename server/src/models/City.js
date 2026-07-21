const mongoose = require('mongoose');

// Every restaurant, delivery partner, and customer address is scoped to a City.
// New cities are added here, never by touching application code.
const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    state: { type: String, default: 'Assam' },
    isActive: { type: Boolean, default: true }, // launch cities on/off without deleting data
    deliveryChargeOverride: { type: Number, default: null }, // null => use platform default
    commissionPercentOverride: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);
