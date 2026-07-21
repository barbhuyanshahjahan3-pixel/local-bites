const router = require('express').Router();
const { protect, allowRoles, blockIfMustChangePassword } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');
const analytics = require('../controllers/analyticsController');

// super_admin can also access every admin route
router.use(protect, allowRoles('admin', 'super_admin'), blockIfMustChangePassword);

router.get('/orders', ctrl.superviseOrders);
router.get('/restaurants', ctrl.listRestaurants);
router.get('/delivery-partners', ctrl.listDeliveryPartners);
router.get('/customers', ctrl.listCustomers);

router.patch('/restaurants/:id', ctrl.editRestaurant);
router.patch('/delivery-partners/:id', ctrl.editDeliveryPartner);

router.patch('/complaints/:id', ctrl.resolveComplaint);
router.get('/complaints', ctrl.listComplaints);
router.patch('/contact', ctrl.updateContact);

router.patch('/orders/:id/reassign-delivery', ctrl.reassignDelivery);
router.patch('/orders/:id/override-status', ctrl.overrideOrderStatus);

router.get('/analytics/orders', analytics.orderAnalytics);
router.get('/analytics/restaurant-performance', analytics.restaurantPerformance);
router.get('/analytics/delivery-performance', analytics.deliveryPerformance);

module.exports = router;
