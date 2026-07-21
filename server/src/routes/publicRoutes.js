const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const ctrl = require('../controllers/customerController');
const City = require('../models/City');
const { PlatformSettings } = require('../models/Misc');

router.get('/restaurants', ctrl.listRestaurants);
router.get('/restaurants/:id', ctrl.getRestaurant);
router.get('/foods/search', ctrl.searchFood);

router.get(
  '/cities',
  asyncHandler(async (req, res) => {
    const cities = await City.find({ isActive: true }).select('name state');
    res.json({ success: true, cities });
  })
);

router.get(
  '/contact',
  asyncHandler(async (req, res) => {
    const settings = await PlatformSettings.findOne({ key: 'platform' }).select('contact');
    res.json({ success: true, contact: settings?.contact || {} });
  })
);

module.exports = router;
