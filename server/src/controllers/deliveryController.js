const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const DeliveryPartner = require('../models/DeliveryPartner');
const { Order } = require('../models/Order');

// PATCH /api/delivery/status { isOnline, lat, lng }
const setOnlineStatus = asyncHandler(async (req, res) => {
  const { isOnline, lat, lng } = req.body;
  const partner = await DeliveryPartner.findByIdAndUpdate(
    req.user.id,
    { isOnline, currentLat: lat, currentLng: lng },
    { new: true }
  );
  res.json({ success: true, partner });
});

// GET /api/delivery/available-orders — unclaimed, ready-for-pickup orders in this partner's city
const availableOrders = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.user.id);
  const orders = await Order.find({
    city: partner.city,
    status: 'ready_for_pickup',
    deliveryPartner: null,
  })
    .select('orderNumber items grandTotal deliveryCharge paymentMethod restaurant createdAt')
    .populate('restaurant', 'name address')
    .sort({ createdAt: 1 });
  res.json({ success: true, orders });
});

// GET /api/delivery/history
const history = asyncHandler(async (req, res) => {
  const orders = await Order.find({ deliveryPartner: req.user.id, status: 'delivered' }).sort({
    deliveredAt: -1,
  });
  res.json({ success: true, orders });
});

// GET /api/delivery/earnings
const earnings = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.user.id).select('totalEarnings totalDeliveries');
  res.json({ success: true, earnings: partner });
});

// GET /api/delivery/history/export-pdf
const exportHistoryPdf = asyncHandler(async (req, res) => {
  const orders = await Order.find({ deliveryPartner: req.user.id, status: 'delivered' }).sort({
    deliveredAt: -1,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="delivery-history.pdf"');

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text('Local Bites — Completed Deliveries', { align: 'center' });
  doc.moveDown();

  orders.forEach((o) => {
    doc
      .fontSize(11)
      .text(`Order: ${o.orderNumber}   Delivered: ${o.deliveredAt?.toDateString() || '-'}`)
      .text(`Delivery charge earned: Rs. ${o.deliveryCharge}`)
      .moveDown(0.5);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Total deliveries: ${orders.length}`);
  doc.text(`Total earned: Rs. ${orders.reduce((s, o) => s + o.deliveryCharge, 0)}`);

  doc.end();
});

// GET /api/delivery/my-order — the partner's single active assignment, if any
const myActiveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    deliveryPartner: req.user.id,
    status: { $in: ['delivery_accepted', 'picked_up', 'on_the_way'] },
  }).select(
    'orderNumber items grandTotal paymentMethod paymentStatus customerName customerMobile deliveryAddress deliveryLat deliveryLng status deliveryPartner'
  );
  res.json({ success: true, order: order || null });
});

module.exports = { setOnlineStatus, availableOrders, myActiveOrder, history, earnings, exportHistoryPdf };
