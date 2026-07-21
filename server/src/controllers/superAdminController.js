const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const DeliveryPartner = require('../models/DeliveryPartner');
const { Admin } = require('../models/AdminModels');
const City = require('../models/City');
const { PlatformSettings } = require('../models/Misc');
const { hashPassword, generateAccessCode, generateTempPassword } = require('../utils/authUtils');

// POST /api/superadmin/restaurants
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, cityId, address, contactPhone, cuisineTags } = req.body;
  const city = await City.findById(cityId);
  if (!city) {
    res.status(400);
    throw new Error('Invalid city');
  }

  const tempPassword = generateTempPassword();
  const restaurant = await Restaurant.create({
    restaurantId: `LB-${city.name.slice(0, 2).toUpperCase()}-REST-${Date.now().toString().slice(-5)}`,
    name,
    description,
    city: cityId,
    address,
    contactPhone,
    cuisineTags,
    accessCode: generateAccessCode('REST'),
    passwordHash: await hashPassword(tempPassword),
    mustChangePassword: true,
  });

  // In production: deliver accessCode + tempPassword via a secure out-of-band channel
  // (e.g. SMS/email to contactPhone), never logged. Returned here for the onboarding flow.
  res.status(201).json({
    success: true,
    restaurant,
    credentials: { accessCode: restaurant.accessCode, tempPassword },
  });
});

// POST /api/superadmin/delivery-partners
const createDeliveryPartner = asyncHandler(async (req, res) => {
  const { name, mobile, cityId, vehicleType } = req.body;
  const city = await City.findById(cityId);
  if (!city) {
    res.status(400);
    throw new Error('Invalid city');
  }

  const tempPassword = generateTempPassword();
  const partner = await DeliveryPartner.create({
    partnerId: `LB-${city.name.slice(0, 2).toUpperCase()}-DEL-${Date.now().toString().slice(-5)}`,
    name,
    mobile,
    city: cityId,
    vehicleType,
    accessCode: generateAccessCode('DEL'),
    passwordHash: await hashPassword(tempPassword),
    mustChangePassword: true,
  });

  res.status(201).json({
    success: true,
    partner,
    credentials: { accessCode: partner.accessCode, tempPassword },
  });
});

// POST /api/superadmin/admins
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const tempPassword = generateTempPassword();
  const admin = await Admin.create({
    adminId: `LB-ADM-${Date.now().toString().slice(-5)}`,
    name,
    email,
    createdBy: req.user.id,
    accessCode: generateAccessCode('ADM'),
    passwordHash: await hashPassword(tempPassword),
    mustChangePassword: true,
  });

  res.status(201).json({
    success: true,
    admin,
    credentials: { accessCode: admin.accessCode, tempPassword },
  });
});

// GET /api/superadmin/admins
const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-passwordHash');
  res.json({ success: true, admins });
});

// PATCH /api/superadmin/admins/:id/disable
const disableAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.params.id, { isDisabled: true }, { new: true });
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  res.json({ success: true, admin });
});

// DELETE /api/superadmin/admins/:id
const removeAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// DELETE /api/superadmin/restaurants/:id
const removeRestaurant = asyncHandler(async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// DELETE /api/superadmin/delivery-partners/:id
const removeDeliveryPartner = asyncHandler(async (req, res) => {
  await DeliveryPartner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// POST /api/superadmin/cities   { name, state }
const addCity = asyncHandler(async (req, res) => {
  const city = await City.create(req.body);
  res.status(201).json({ success: true, city });
});

// DELETE /api/superadmin/cities/:id
const removeCity = asyncHandler(async (req, res) => {
  await City.findByIdAndUpdate(req.params.id, { isActive: false }); // soft-remove: preserves history
  res.json({ success: true });
});

// PATCH /api/superadmin/settings
const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await PlatformSettings.findOneAndUpdate({ key: 'platform' }, req.body, {
    new: true,
    upsert: true,
  });
  res.json({ success: true, settings });
});

module.exports = {
  createRestaurant,
  createDeliveryPartner,
  createAdmin,
  listAdmins,
  disableAdmin,
  removeAdmin,
  removeRestaurant,
  removeDeliveryPartner,
  addCity,
  removeCity,
  updatePlatformSettings,
};
