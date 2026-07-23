const asyncHandler = require('express-async-handler');
const { Category, Food } = require('../models/Food');
const { Order } = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// GET /api/restaurant/profile
const getProfile = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user.id).select('-passwordHash');
  res.json({ success: true, restaurant });
});

// PATCH /api/restaurant/profile  { name?, description?, address?, lat?, lng?, cuisineTags? }
const updateProfile = asyncHandler(async (req, res) => {
  const { name, description, address, lat, lng, cuisineTags } = req.body;
  const restaurant = await Restaurant.findById(req.user.id);
  if (name !== undefined) restaurant.name = name;
  if (description !== undefined) restaurant.description = description;
  if (address !== undefined) restaurant.address = address;
  if (lat !== undefined) restaurant.lat = lat;
  if (lng !== undefined) restaurant.lng = lng;
  if (cuisineTags !== undefined) restaurant.cuisineTags = cuisineTags;
  await restaurant.save();
  res.json({ success: true, restaurant });
});

// POST /api/restaurant/gallery  { imageBase64 }
const addGalleryImage = asyncHandler(async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400);
    throw new Error('No image provided');
  }
  const uploaded = await uploadImage(imageBase64, 'local-bites/restaurant-gallery');
  const restaurant = await Restaurant.findById(req.user.id);
  restaurant.galleryImages.push({ url: uploaded.url, publicId: uploaded.publicId });
  await restaurant.save();
  res.json({ success: true, galleryImages: restaurant.galleryImages });
});

// DELETE /api/restaurant/gallery/:publicId
const deleteGalleryImage = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user.id);
  const image = restaurant.galleryImages.find((g) => g.publicId === req.params.publicId);
  if (image) {
    await deleteImage(image.publicId).catch(() => {}); // best-effort cleanup on Cloudinary
    restaurant.galleryImages = restaurant.galleryImages.filter((g) => g.publicId !== req.params.publicId);
    await restaurant.save();
  }
  res.json({ success: true, galleryImages: restaurant.galleryImages });
});

// GET /api/restaurant/categories
const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ restaurant: req.user.id }).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
});

// GET /api/restaurant/foods
const listFoods = asyncHandler(async (req, res) => {
  const foods = await Food.find({ restaurant: req.user.id }).populate('category', 'name').sort({ createdAt: -1 });
  res.json({ success: true, foods });
});

// POST /api/restaurant/categories { name }
const addCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ name: req.body.name, restaurant: req.user.id });
  res.status(201).json({ success: true, category });
});

// POST /api/restaurant/foods  { categoryId, name, description, price, offerPrice, isVeg, imageBase64 }
const addFood = asyncHandler(async (req, res) => {
  const { categoryId, name, description, price, offerPrice, isVeg, imageBase64 } = req.body;
  let imageUrl, imagePublicId;
  if (imageBase64) {
    const uploaded = await uploadImage(imageBase64, 'local-bites/food');
    imageUrl = uploaded.url;
    imagePublicId = uploaded.publicId;
  }
  const food = await Food.create({
    restaurant: req.user.id,
    category: categoryId,
    name,
    description,
    price,
    offerPrice: offerPrice ?? null,
    isVeg,
    imageUrl,
    imagePublicId,
  });
  res.status(201).json({ success: true, food });
});

// PATCH /api/restaurant/foods/:id
const editFood = asyncHandler(async (req, res) => {
  const food = await Food.findOne({ _id: req.params.id, restaurant: req.user.id });
  if (!food) {
    res.status(404);
    throw new Error('Food not found');
  }
  const { name, description, price, offerPrice, isVeg, isAvailable, imageBase64 } = req.body;
  if (imageBase64) {
    await deleteImage(food.imagePublicId);
    const uploaded = await uploadImage(imageBase64, 'local-bites/food');
    food.imageUrl = uploaded.url;
    food.imagePublicId = uploaded.publicId;
  }
  Object.assign(food, {
    name: name ?? food.name,
    description: description ?? food.description,
    price: price ?? food.price,
    offerPrice: offerPrice === undefined ? food.offerPrice : offerPrice,
    isVeg: isVeg ?? food.isVeg,
    isAvailable: isAvailable ?? food.isAvailable,
  });
  await food.save();
  res.json({ success: true, food });
});

// DELETE /api/restaurant/foods/:id
const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findOne({ _id: req.params.id, restaurant: req.user.id });
  if (!food) {
    res.status(404);
    throw new Error('Food not found');
  }
  await deleteImage(food.imagePublicId);
  await food.deleteOne();
  res.json({ success: true });
});

// GET /api/restaurant/reports/sales?from=&to=
const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { restaurant: req.user.id, status: 'delivered' };
  if (from || to) {
    match.deliveredAt = {};
    if (from) match.deliveredAt.$gte = new Date(from);
    if (to) match.deliveredAt.$lte = new Date(to);
  }
  const orders = await Order.find(match);
  const totalRevenue = orders.reduce((sum, o) => sum + o.itemsTotal, 0);
  const totalCommission = orders.reduce((sum, o) => sum + o.platformCommission, 0);
  res.json({
    success: true,
    report: {
      orderCount: orders.length,
      totalRevenue,
      totalCommission,
      netPayout: totalRevenue - totalCommission,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  addGalleryImage,
  deleteGalleryImage,
  addCategory,
  listCategories,
  addFood,
  listFoods,
  editFood,
  deleteFood,
  salesReport,
};
