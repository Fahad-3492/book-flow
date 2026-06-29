const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validators');

const router = express.Router();

router.post(
  '/create-intent',
  requireAuth,
  [body('bookingId').isInt({ min: 1 }).withMessage('A valid bookingId is required.'), handleValidation],
  createPaymentIntent
);

// Note: the webhook route itself is mounted separately in app.js, BEFORE
// express.json(), because Stripe's signature check needs the raw request
// body. It is intentionally not registered here under /api/payments.

module.exports = router;
