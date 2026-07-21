const asyncHandler = require('express-async-handler');
const { Category, Food } = require('../models/Food');
const { Order } = require('../models/Order');
const { uploadImage, deleteImage } = require('../config/cloudinary');

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

module.exports = { addCategory, listCategories, addFood, listFoods, editFood, deleteFood, salesReport };
