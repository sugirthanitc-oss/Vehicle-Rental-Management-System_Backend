const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'drivepulse_rtcros_super_secret_jwt_key_2026_major_project', {
    expiresIn: '30d'
  });
};

// @desc    Send OTP to 10-digit mobile number (Demo OTP: 123456)
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const demoOTP = '123456';
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Update user record if exists
    await User.findOneAndUpdate(
      { phone: phone.trim() },
      { otp: demoOTP, otpExpires },
      { new: true, upsert: false }
    );

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${phone}! (Demo OTP: 123456)`,
      otpDemo: '123456'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login via 10-digit mobile number & OTP
// @route   POST /api/auth/verify-otp-login
// @access  Public
const verifyOTPLogin = async (req, res) => {
  try {
    const { phone, otp, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number and OTP' });
    }

    const user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this 10-digit mobile number' });
    }

    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: `Account registered as ${user.role}. Please select correct login role.` });
    }

    // Demo OTP check (123456)
    if (otp !== '123456' && user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Use demo OTP: 123456' });
    }

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
        avatar: user.avatar
      }
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
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register Vehicle Provider (Owner) Account
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

    const userExists = await User.findOne({ phone: phone.trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Account with this mobile number already exists' });
    }

    const user = await User.create({
      name,
      phone: phone.trim(),
      email: email.toLowerCase(),
      shopName,
      gstNumber,
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
        gstNumber: user.gstNumber,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Standard Password Login (Backup)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    const query = phone ? { phone: phone.trim() } : { email: email.toLowerCase() };
    const user = await User.findOne(query);

    if (user && (await user.matchPassword(password))) {
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
          avatar: user.avatar
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid mobile number/email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password Recovery
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide 10-digit mobile number and new password' });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this 10-digit mobile number' });
    }

    user.password = newPassword;
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

// @desc    Update Profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.shopName) user.shopName = req.body.shopName;
    if (req.body.gstNumber) user.gstNumber = req.body.gstNumber;

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        shopName: updatedUser.shopName,
        gstNumber: updatedUser.gstNumber,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendOTP,
  verifyOTPLogin,
  registerCustomer,
  registerProvider,
  loginUser,
  resetPassword,
  getMe,
  updateProfile
};
