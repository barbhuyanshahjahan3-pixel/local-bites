const router = require('express').Router();
const { protect, allowRoles, blockIfMustChangePassword } = require('../middleware/auth');
const ctrl = require('../controllers/restaurantController');
const orderCtrl = require('../controllers/orderController');

router.use(protect, allowRoles('restaurant'), blockIfMustChangePassword);

router.post('/categories', ctrl.addCategory);
router.get('/categories', ctrl.listCategories);
router.post('/foods', ctrl.addFood);
router.get('/foods', ctrl.listFoods);
router.patch('/foods/:id', ctrl.editFood);
router.delete('/foods/:id', ctrl.deleteFood);
router.get('/reports/sales', ctrl.salesReport);

router.get('/orders', orderCtrl.getRestaurantOrders);
router.patch('/orders/:id/status', orderCtrl.updateRestaurantStatus);

module.exports = router;
