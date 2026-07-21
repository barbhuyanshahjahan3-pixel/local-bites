const mongoose = require('mongoose');
const { staffAccountFields } = require('./schemaHelpers');

const restaurantSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true, unique: true }, // e.g. LB-HJ-REST-001
    name: { type: String, required: true, trim: true },
    description: String,
    logoUrl: String,
    logoPublicId: String,
    coverImageUrl: String,
    coverImagePublicId: String,
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    address: { type: String, required: true },
    // Restaurant's own contact for platform/admin use only — NOT exposed to customers,
    // and customers' phone/address are not exposed to the restaurant (see controllers).
    contactPhone: { type: String, required: true },
    cuisineTags: [String],
    isOpen: { type: Boolean, default: true }, // toggled by restaurant (e.g. closing time)
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    commissionPercentOverride: { type: Number, default: null },
    ...staffAccountFields,
  },
  { timestamps: true }
);

restaurantSchema.index({ city: 1, isOpen: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
