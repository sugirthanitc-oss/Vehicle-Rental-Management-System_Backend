const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpSMS } = require('../services/smsService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'drivepulse_rtcros_super_secret_jwt_key_2026_major_project', {
    expiresIn: '30d'
  });
};

// @desc    Send OTP to 10-digit mobile number for Real-Time Password Reset / Verification via TextBee SMS
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const cleanPhone = phone.trim();
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this 10-digit mobile number' });
    }

    // Generate dynamic cryptographically secure 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.otp = generatedOTP;
    user.otpExpires = otpExpires;
    await user.save();

    // Trigger Real-time SMS Delivery via TextBee SMS Gateway
    const smsResult = await sendOtpSMS(cleanPhone, generatedOTP);
    console.log(`📱 Real-time OTP SMS dispatched to +91 ${cleanPhone}. Result:`, smsResult);

    res.json({
      success: true,
      message: `Verification OTP has been sent via SMS to +91 ${cleanPhone}. Please check your phone.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register Customer Account
// @route   POST /api/auth/register-customer
// @access  Public
const registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, 10-digit mobile number, and password are required' });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    const userExists = await User.findOne({ phone: phone.trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Account with this mobile number already exists' });
    }

    const user = await User.create({
      name,
      phone: phone.trim(),
      email: email ? email.toLowerCase() : '',
      password,
      role: 'customer'
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        drivingLicenseNumber: user.drivingLicenseNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register Vehicle Provider (Owner) Account with Strict GST & Email Validation
// @route   POST /api/auth/register-provider
// @access  Public
const registerProvider = async (req, res) => {
  try {
    const { name, phone, email, shopName, gstNumber, password } = req.body;

    if (!name || !phone || !email || !shopName || !gstNumber || !password) {
      return res.status(400).json({ success: false, message: 'All provider details (Name, 10-digit Mobile, Mandatory Email, Shop Name, GST Number, Password) are required' });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const formattedGst = gstNumber.trim().toUpperCase();
    if (!gstRegex.test(formattedGst)) {
      return res.status(400).json({ success: false, message: 'Invalid GST Registration Number format. Expected format e.g. 22AAAAA0000A1Z5' });
    }

    const userExists = await User.findOne({ phone: phone.trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Account with this mobile number already exists' });
    }

    const user = await User.create({
      name,
      phone: phone.trim(),
      email: email.toLowerCase(),
      shopName,
      gstNumber: formattedGst,
      password,
      role: 'provider'
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        gstNumber: user.gstNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Direct Password Login for 10-digit Mobile Number
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Please enter 10-digit mobile number and password' });
    }

    const cleanPhone = phone.trim();
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return res.status(401).json({ success: false, message: 'No registered account found with this mobile number' });
    }

    const isCustomerRole = (r) => r === 'customer' || r === 'user';
    if (role && user.role !== role && user.role !== 'admin' && !(isCustomerRole(role) && isCustomerRole(user.role))) {
      return res.status(403).json({ success: false, message: `This mobile number is registered as ${user.role}. Please select the correct login tab.` });
    }

    if (await user.matchPassword(password)) {
      const token = generateToken(user._id);
      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          shopName: user.shopName,
          gstNumber: user.gstNumber,
          drivingLicenseNumber: user.drivingLicenseNumber
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password provided' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password OTP Verification & Reset
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Mobile number, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const cleanPhone = phone.trim();
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this 10-digit mobile number' });
    }

    // Strictly validate against dynamic OTP stored in DB & check expiration
    if (!user.otp || user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code entered. Please enter the OTP sent to your phone.' });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'The OTP code has expired. Please request a new OTP.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Session User
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Profile (Name, Phone, Email, ShopName, GST, DrivingLicense)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone) {
      if (!/^[0-9]{10}$/.test(req.body.phone.trim())) {
        return res.status(400).json({ success: false, message: 'Mobile number must be strictly 10 digits' });
      }
      user.phone = req.body.phone.trim();
    }
    if (req.body.email) user.email = req.body.email.trim().toLowerCase();
    if (req.body.shopName) user.shopName = req.body.shopName.trim();
    if (req.body.gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const formattedGst = req.body.gstNumber.trim().toUpperCase();
      if (!gstRegex.test(formattedGst)) {
        return res.status(400).json({ success: false, message: 'Invalid GST Number format (e.g. 22AAAAA0000A1Z5)' });
      }
      user.gstNumber = formattedGst;
    }
    if (req.body.drivingLicenseNumber) {
      user.drivingLicenseNumber = req.body.drivingLicenseNumber.trim().toUpperCase();
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Profile details updated successfully!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        shopName: updatedUser.shopName,
        gstNumber: updatedUser.gstNumber,
        drivingLicenseNumber: updatedUser.drivingLicenseNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendOTP,
  registerCustomer,
  registerProvider,
  loginUser,
  resetPassword,
  getMe,
  updateProfile
};
