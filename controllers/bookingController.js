const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { sendBookingSubmittedSMS, sendBookingApprovedSMS } = require('../services/smsService');

// @desc    Create a new booking reservation (Customer)
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      drivingLicenseNumber,
      pickupLocation,
      destinationLocation,
      paymentType,
      paymentMethod
    } = req.body;

    if (!vehicleId || !startDate || !endDate || !drivingLicenseNumber || !pickupLocation) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, Pickup Date, Return Date, Driving License Number, and Pickup Location ("From") are required'
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (!vehicle.isAvailable || vehicle.status === 'Rented') {
      return res.status(400).json({ success: false, message: 'Vehicle is currently rented or unavailable' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const dailyRate = vehicle.dailyRate;
    const subtotal = dailyRate * totalDays;
    const serviceFee = Math.round(subtotal * 0.08);
    const insuranceFee = 25 * totalDays;
    const totalPrice = subtotal + serviceFee + insuranceFee;

    // Flexible Payment Calculations (Full 100% vs Split 50%)
    const isSplit = paymentType === 'Split';
    const amountPaid = isSplit ? Math.round(totalPrice / 2) : totalPrice;
    const remainingAmount = isSplit ? totalPrice - amountPaid : 0;
    const paymentStatus = isSplit ? 'Partial Paid' : 'Fully Paid';

    const booking = await Booking.create({
      user: req.user._id,
      provider: vehicle.provider,
      vehicle: vehicle._id,
      drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
      pickupLocation: pickupLocation.trim(),
      destinationLocation: destinationLocation ? destinationLocation.trim() : 'Local City Limit',
      startDate: start,
      endDate: end,
      totalDays,
      dailyRate,
      subtotal,
      serviceFee,
      insuranceFee,
      totalPrice,
      paymentType: isSplit ? 'Split' : 'Full',
      amountPaid,
      remainingAmount,
      paymentStatus,
      approvalStatus: 'Waiting for Approval', // Requires provider approval
      paymentMethod: paymentMethod || 'Online Split Payment'
    });

    const populatedBooking = await Booking.findById(booking._id).populate('vehicle');

    // Trigger SMS to customer
    if (req.user?.phone) {
      sendBookingSubmittedSMS(req.user.phone, booking.bookingReference, vehicle.title).catch((err) =>
        console.error('Booking submitted SMS err:', err)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Booking submitted! Status: Waiting for Provider Approval',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Customer's own bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Provider's incoming booking requests
// @route   GET /api/bookings/provider-requests
// @access  Private (Provider)
const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate('user', 'name phone email avatar')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Provider Approves Booking & Generates Pickup Verification Code
// @route   PUT /api/bookings/:id/approve
// @access  Private (Provider)
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reservation not found' });
    }

    // Verification code e.g. "PKUP-8912"
    const verificationCode = 'PKUP-' + Math.floor(1000 + Math.random() * 9000);

    booking.approvalStatus = 'Approved';
    booking.verificationCode = verificationCode;
    await booking.save();

    // Mark vehicle as rented in garage fleet
    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'Rented' });

    const updatedBooking = await Booking.findById(booking._id).populate('vehicle').populate('user');

    // Trigger SMS with Pickup Verification Code to customer
    if (updatedBooking.user?.phone) {
      sendBookingApprovedSMS(
        updatedBooking.user.phone,
        booking.bookingReference,
        updatedBooking.vehicle?.title || 'Vehicle',
        verificationCode
      ).catch((err) => console.error('Approval SMS err:', err));
    }

    res.json({
      success: true,
      message: `Reservation approved! Generated Verification Code: ${verificationCode}`,
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Provider Rejects Booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (Provider)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.approvalStatus = 'Rejected';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking request rejected and payment refunded.',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer Pays Remaining Amount for Split Payment
// @route   PUT /api/bookings/:id/pay-remaining
// @access  Private (Customer)
const payRemainingAmount = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.remainingAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No remaining balance for this booking' });
    }

    booking.amountPaid = booking.totalPrice;
    booking.remainingAmount = 0;
    booking.paymentStatus = 'Fully Paid';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id).populate('vehicle');

    res.json({
      success: true,
      message: 'Remaining balance paid successfully! Reservation is fully paid.',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel Booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.approvalStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'Available' });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  approveBooking,
  rejectBooking,
  payRemainingAmount,
  cancelBooking
};
