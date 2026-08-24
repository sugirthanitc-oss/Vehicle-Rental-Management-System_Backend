const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  // Customer License Verification
  drivingLicenseNumber: {
    type: String,
    required: [true, 'Driving License Number is mandatory for booking']
  },
  // Location Distance Details
  pickupLocation: {
    type: String,
    required: true // "From"
  },
  destinationLocation: {
    type: String,
    default: 'Local City Limit' // "To"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  dailyRate: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  serviceFee: {
    type: Number,
    required: true
  },
  insuranceFee: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  // Flexible Payment Gateway
  paymentType: {
    type: String,
    enum: ['Full', 'Split'],
    default: 'Full'
  },
  amountPaid: {
    type: Number,
    required: true
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Fully Paid', 'Partial Paid', 'Refunded'],
    default: 'Fully Paid'
  },
  // Provider Approval & Verification Code Workflow
  approvalStatus: {
    type: String,
    enum: ['Waiting for Approval', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Waiting for Approval'
  },
  verificationCode: {
    type: String // Pickup Code generated upon provider approval e.g. "PKUP-8921"
  },
  bookingReference: {
    type: String,
    unique: true
  },
  paymentMethod: {
    type: String,
    default: 'Credit Card / UPI Payment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate reference code before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'DP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
