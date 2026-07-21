const router = require('express').Router();
const { staffLogin, changeStaffPassword, customerRegister } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/staff-login', staffLogin);
router.post('/change-password', protect, changeStaffPassword);
router.post('/customer/register', customerRegister);

module.exports = router;
