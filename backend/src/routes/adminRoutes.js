const express = require('express');
const {
  listAllServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
} = require('../controllers/serviceController');
const {
  listAllBookingsAdmin,
  updateBookingStatusAdmin,
  getAvailabilityAdmin,
  setAvailabilityAdmin,
  deleteAvailabilityAdmin,
  getStatsAdmin,
} = require('../controllers/bookingController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const {
  createServiceValidation,
  updateServiceValidation,
  updateBookingStatusValidation,
  setAvailabilityValidation,
} = require('../middleware/validators');

const router = express.Router();

// Every route below requires a valid token AND admin role.
router.use(requireAuth, requireAdmin);

router.get('/services', listAllServicesAdmin);
router.post('/services', createServiceValidation, createServiceAdmin);
router.patch('/services/:id', updateServiceValidation, updateServiceAdmin);
router.delete('/services/:id', deleteServiceAdmin);

router.get('/bookings', listAllBookingsAdmin);
router.patch('/bookings/:id/status', updateBookingStatusValidation, updateBookingStatusAdmin);

router.get('/stats', getStatsAdmin);

router.get('/availability', getAvailabilityAdmin);
router.post('/availability', setAvailabilityValidation, setAvailabilityAdmin);
router.delete('/availability/:id', deleteAvailabilityAdmin);

module.exports = router;
