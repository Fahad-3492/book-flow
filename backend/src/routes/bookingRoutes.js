const express = require('express');
const {
  getAvailableSlots,
  createBookingHandler,
  getMyBookings,
  getBooking,
} = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/authMiddleware');
const { createBookingValidation } = require('../middleware/validators');

const router = express.Router();

// Public — anyone can check available slots before logging in.
router.get('/available-slots', getAvailableSlots);

// Everything below requires login.
router.use(requireAuth);

router.post('/', createBookingValidation, createBookingHandler);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);

module.exports = router;
