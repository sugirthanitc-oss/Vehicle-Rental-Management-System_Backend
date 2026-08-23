const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// @desc    Create a new booking reservation
// @route   POST /api/bookings
// @access  Private (Protected)
const createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, paymentMethod } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide vehicle ID, start date, and end date' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ success: false, message: 'Vehicle is currently unavailable for rental' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const dailyRate = vehicle.dailyRate;
    const subtotal = dailyRate * totalDays;
    const serviceFee = Math.round(subtotal * 0.08); // 8% service fee
    const insuranceFee = 25 * totalDays; // $25 per day insurance
    const totalPrice = subtotal + serviceFee + insuranceFee;

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicle._id,
      startDate: start,
      endDate: end,
      totalDays,
      dailyRate,
      subtotal,
      serviceFee,
      insuranceFee,
      totalPrice,
      pickupLocation: vehicle.location,
      paymentMethod: paymentMethod || 'Credit Card (Visa ending 4242)',
      status: 'Confirmed',
      paymentStatus: 'Paid'
    });

    // Populate vehicle details for instant response display
    const populatedBooking = await Booking.findById(booking._id).populate('vehicle');

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating booking' });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Protected)
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
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Protected)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reservation not found' });
    }

    // Verify ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this reservation' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id).populate('vehicle');

    res.json({
      success: true,
      message: 'Booking reservation successfully cancelled.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking
};
