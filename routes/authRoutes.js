const express = require('express');
const router = express.Router();
const {
  sendOTP,
  registerCustomer,
  registerProvider,
  loginUser,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOTP);
router.post('/register-customer', registerCustomer);
router.post('/register-provider', registerProvider);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
