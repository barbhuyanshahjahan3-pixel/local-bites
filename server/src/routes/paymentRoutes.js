const router = require('express').Router();
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { protect, allowRoles } = require('../middleware/auth');
const { Order } = require('../models/Order');

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

    const order = await Order.findOneAndUpdate(
      { _id: orderId, customer: req.user.id },
      { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    res.json({ success: true, order });
  })
);

module.exports = router;
