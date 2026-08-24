const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  approveBooking,
  rejectBooking,
  payRemainingAmount,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/provider-requests', getProviderBookings);
router.put('/:id/approve', approveBooking);
router.put('/:id/reject', rejectBooking);
router.put('/:id/pay-remaining', payRemainingAmount);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
