const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const { Order } = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { PlatformSettings } = require('../models/Misc');
const { emitToRestaurant, emitToCustomer, emitToDeliveryPool, emitToPartner } = require('../sockets/emit');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const nextOrderNumber = async (cityCode) => {
  const count = await Order.countDocuments();
  return `LB-${cityCode}-${String(count + 1).padStart(6, '0')}`;
};

// POST /api/orders  (customer)
// Body: { restaurantId, items: [{foodId, quantity}], paymentMethod, name, mobile, deliveryAddress, lat, lng }
const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, paymentMethod, name, mobile, deliveryAddress, lat, lng } = req.body;
  const restaurant = await Restaurant.findById(restaurantId).populate('city');
  if (!restaurant || !restaurant.isOpen) {
    res.status(400);
    throw new Error('Restaurant unavailable');
  }

  const { Food } = require('../models/Food');
  let itemsTotal = 0;
  const orderItems = [];
  for (const line of items) {
    const food = await Food.findById(line.foodId);
    if (!food || !food.isAvailable) continue;
    const unitPrice = food.offerPrice ?? food.price;
    itemsTotal += unitPrice * line.quantity;
    orderItems.push({ food: food._id, name: food.name, price: unitPrice, quantity: line.quantity });
  }
  if (orderItems.length === 0) {
    res.status(400);
    throw new Error('No valid items in order');
  }

  const settings = await PlatformSettings.findOne({ key: 'platform' });
  const deliveryCharge =
    restaurant.city.deliveryChargeOverride ?? settings?.defaultDeliveryCharge ?? 30;
  const commissionPercent =
    restaurant.commissionPercentOverride ??
    restaurant.city.commissionPercentOverride ??
    settings?.defaultCommissionPercent ??
    15;
  const platformCommission = Math.round((itemsTotal * commissionPercent) / 100);
  const grandTotal = itemsTotal + deliveryCharge;

  const orderNumber = await nextOrderNumber(restaurant.city.name.slice(0, 2).toUpperCase());

  const order = await Order.create({
    orderNumber,
    customer: req.user.id,
    restaurant: restaurant._id,
    city: restaurant.city._id,
    items: orderItems,
    itemsTotal,
    deliveryCharge,
    platformCommission,
    grandTotal,
    paymentMethod,
    customerName: name,
    customerMobile: mobile,
    deliveryAddress,
    deliveryLat: lat,
    deliveryLng: lng,
    status: 'placed',
    statusHistory: [{ status: 'placed', by: 'customer' }],
  });

  let razorpayOrder = null;
  if (paymentMethod === 'online') {
    razorpayOrder = await razorpay.orders.create({
      amount: grandTotal * 100, // paise
      currency: 'INR',
      receipt: orderNumber,
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
  }

  // Restaurant only ever sees what it needs to prepare the order — not the address/mobile.
  emitToRestaurant(restaurant._id.toString(), 'new_order', {
    orderId: order._id,
    orderNumber,
    items: orderItems,
  });

  res.status(201).json({
    success: true,
    order,
    razorpayOrder,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  });
});

// PATCH /api/orders/:id/restaurant-status  (restaurant)  { action: 'accept'|'reject'|'preparing'|'ready', reason? }
const updateRestaurantStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || String(order.restaurant) !== req.user.id) {
    res.status(404);
    throw new Error('Order not found');
  }

  const map = {
    accept: 'restaurant_accepted',
    reject: 'restaurant_rejected',
    preparing: 'preparing',
    ready: 'ready_for_pickup',
  };
  const newStatus = map[req.body.action];
  if (!newStatus) {
    res.status(400);
    throw new Error('Invalid action');
  }

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, by: 'restaurant', note: req.body.reason });
  if (newStatus === 'restaurant_rejected') {
    order.rejectedBy = 'restaurant';
    order.rejectionReason = req.body.reason;
  }
  await order.save();

  emitToCustomer(order.customer.toString(), 'order_status', { orderId: order._id, status: newStatus });

  // Once food is ready for pickup, broadcast to the online delivery pool in that city.
  if (newStatus === 'ready_for_pickup') {
    emitToDeliveryPool(order.city.toString(), 'delivery_available', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      restaurantName: undefined, // populate on client via restaurant id if needed
    });
  }

  res.json({ success: true, order });
});

// PATCH /api/orders/:id/delivery-status (delivery partner) { action: 'accept'|'reject'|'pickup'|'on_the_way'|'delivered', reason? }
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { action, reason } = req.body;

  if (action === 'accept') {
    if (order.deliveryPartner) {
      res.status(409);
      throw new Error('Order already claimed');
    }
    order.deliveryPartner = req.user.id;
    order.status = 'delivery_accepted';
    order.statusHistory.push({ status: 'delivery_accepted', by: `delivery_partner:${req.user.id}` });
  } else if (action === 'reject') {
    order.status = 'delivery_rejected';
    order.rejectedBy = `delivery_partner:${req.user.id}`;
    order.rejectionReason = reason;
    order.statusHistory.push({ status: 'delivery_rejected', by: `delivery_partner:${req.user.id}`, note: reason });
    // Re-open to the pool so another partner can accept it.
    order.deliveryPartner = null;
    order.status = 'ready_for_pickup';
    emitToDeliveryPool(order.city.toString(), 'delivery_available', {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } else if (['pickup', 'on_the_way', 'delivered'].includes(action)) {
    if (String(order.deliveryPartner) !== req.user.id) {
      res.status(403);
      throw new Error('Not your assigned order');
    }
    const map = { pickup: 'picked_up', on_the_way: 'on_the_way', delivered: 'delivered' };
    order.status = map[action];
    order.statusHistory.push({ status: order.status, by: `delivery_partner:${req.user.id}` });
    if (action === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') order.paymentStatus = 'paid';

      const DeliveryPartner = require('../models/DeliveryPartner');
      await DeliveryPartner.findByIdAndUpdate(req.user.id, {
        $inc: { totalEarnings: order.deliveryCharge, totalDeliveries: 1 },
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid action');
  }

  await order.save();
  emitToCustomer(order.customer.toString(), 'order_status', { orderId: order._id, status: order.status });
  res.json({ success: true, order });
});

// GET /api/orders/:id/for-delivery-partner  — only the assigned partner sees customer contact/address
const getOrderForDeliveryPartner = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select(
    'orderNumber items grandTotal paymentMethod paymentStatus customerName customerMobile deliveryAddress deliveryLat deliveryLng status deliveryPartner'
  );
  if (!order || String(order.deliveryPartner) !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }
  res.json({ success: true, order });
});

// GET /api/orders/mine/:id (customer) — includes full status history for tracking
const getMyOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user.id }).populate(
    'restaurant',
    'name'
  );
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({ success: true, order });
});

// GET /api/orders/mine (customer)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// GET /api/orders/restaurant (restaurant) — deliberately excludes customer mobile/address
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ restaurant: req.user.id })
    .select('-customerMobile -deliveryAddress -deliveryLat -deliveryLng')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

module.exports = {
  placeOrder,
  updateRestaurantStatus,
  updateDeliveryStatus,
  getOrderForDeliveryPartner,
  getMyOrders,
  getMyOrderDetail,
  getRestaurantOrders,
};
