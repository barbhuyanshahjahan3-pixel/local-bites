const router = require('express').Router();
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { protect, allowRoles } = require('../middleware/auth');
const { Order } = require('../models/Order');
const { emitToRestaurant } = require('../sockets/emit');

// POST /api/payments/verify (customer)
// Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post(
  '/verify',
  protect,
  allowRoles('customer'),
  asyncHandler(async (req, res) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error('Payment verification failed');
    }

    const order = await Order.findOne({ _id: orderId, customer: req.user.id });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // 'online' method = the full amount just cleared -> fully paid.
    // 'cod' method = only the 50% advance just cleared -> rest is still cash on delivery.
    order.paymentStatus = order.paymentMethod === 'online' ? 'paid' : 'advance_paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // The restaurant is only told about the order now that it's actually paid for —
    // an order that never completes payment never reaches the restaurant at all.
    emitToRestaurant(order.restaurant.toString(), 'new_order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
    });

    res.json({ success: true, order });
  })
);

module.exports = router;
