const asyncHandler = require('express-async-handler');
const { Order } = require('../models/Order');

const dateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  if (period === 'daily') start.setDate(now.getDate() - 1);
  else if (period === 'weekly') start.setDate(now.getDate() - 7);
  else start.setMonth(now.getMonth() - 1); // monthly (default)
  return { start, end: now };
};

// GET /api/admin/analytics/orders?period=daily|weekly|monthly&cityId=
const orderAnalytics = asyncHandler(async (req, res) => {
  const { period = 'monthly', cityId } = req.query;
  const { start, end } = dateRange(period);
  const filter = { createdAt: { $gte: start, $lte: end } };
  if (cityId) filter.city = cityId;

  const orders = await Order.find(filter);
  const delivered = orders.filter((o) => o.status === 'delivered');
  const cancelled = orders.filter((o) => o.status === 'cancelled');
  const rejected = orders.filter((o) => ['restaurant_rejected', 'delivery_rejected'].includes(o.status));

  const rejectedByRestaurant = rejected.filter((o) => o.rejectedBy === 'restaurant').length;
  const rejectedByDelivery = rejected.filter((o) => o.rejectedBy?.startsWith('delivery_partner')).length;

  const revenue = delivered.reduce((s, o) => s + o.itemsTotal, 0);
  const commission = delivered.reduce((s, o) => s + o.platformCommission, 0);
  const deliveryCharges = delivered.reduce((s, o) => s + o.deliveryCharge, 0);

  res.json({
    success: true,
    period,
    totals: {
      orderCount: orders.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      rejected: rejected.length,
      rejectedByRestaurant,
      rejectedByDelivery,
      revenue,
      platformCommission: commission,
      deliveryCharges,
      profitAndLoss: commission - 0, // extend with operating cost deductions as needed
    },
  });
});

// GET /api/admin/analytics/restaurant-performance
const restaurantPerformance = asyncHandler(async (req, res) => {
  const results = await Order.aggregate([
    { $match: { status: 'delivered' } },
    {
      $group: {
        _id: '$restaurant',
        orderCount: { $sum: 1 },
        revenue: { $sum: '$itemsTotal' },
        commission: { $sum: '$platformCommission' },
      },
    },
    { $sort: { revenue: -1 } },
    {
      $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' },
    },
    { $unwind: '$restaurant' },
    { $project: { name: '$restaurant.name', orderCount: 1, revenue: 1, commission: 1 } },
  ]);
  res.json({ success: true, results });
});

// GET /api/admin/analytics/delivery-performance
const deliveryPerformance = asyncHandler(async (req, res) => {
  const results = await Order.aggregate([
    { $match: { status: 'delivered', deliveryPartner: { $ne: null } } },
    {
      $group: {
        _id: '$deliveryPartner',
        deliveries: { $sum: 1 },
        earnings: { $sum: '$deliveryCharge' },
      },
    },
    { $sort: { deliveries: -1 } },
    {
      $lookup: { from: 'deliverypartners', localField: '_id', foreignField: '_id', as: 'partner' },
    },
    { $unwind: '$partner' },
    { $project: { name: '$partner.name', deliveries: 1, earnings: 1 } },
  ]);
  res.json({ success: true, results });
});

module.exports = { orderAnalytics, restaurantPerformance, deliveryPerformance };
