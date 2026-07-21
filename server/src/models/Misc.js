const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // only reviewable after delivery
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    resolutionNote: String,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

// Singleton document holding platform-wide configurable settings.
const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'platform', unique: true },
    defaultCommissionPercent: { type: Number, default: 15 },
    defaultDeliveryCharge: { type: Number, default: 30 },
    contact: {
      phone: String,
      supportEmail: String,
      facebook: String,
      instagram: String,
      whatsapp: String,
    },
    razorpayEnabled: { type: Boolean, default: true },
    codEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = {
  Review: mongoose.model('Review', reviewSchema),
  Complaint: mongoose.model('Complaint', complaintSchema),
  PlatformSettings: mongoose.model('PlatformSettings', platformSettingsSchema),
};
