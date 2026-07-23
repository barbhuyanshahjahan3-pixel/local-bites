const router = require('express').Router();
const { protect, allowRoles } = require('../middleware/auth');
const ctrl = require('../controllers/customerController');
const orderCtrl = require('../controllers/orderController');

router.use(protect, allowRoles('customer'));

router.post('/orders', orderCtrl.placeOrder);
router.get('/orders/mine', orderCtrl.getMyOrders);
router.get('/orders/mine/:id', orderCtrl.getMyOrderDetail);
router.patch('/orders/:id/cancel', orderCtrl.cancelOrder);

router.post('/wishlist/:foodId', ctrl.toggleWishlist);
router.get('/wishlist', ctrl.getWishlist);
router.post('/reviews', ctrl.addReview);
router.post('/complaints', ctrl.fileComplaint);
router.get('/complaints/mine', ctrl.myComplaints);

module.exports = router;
