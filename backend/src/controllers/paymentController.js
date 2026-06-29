const stripe = require('../config/stripe');
const { findBookingById, updateBookingPayment } = require('../models/bookingModel');

// POST /api/payments/create-intent  (authenticated — booking owner only)
// Creates a Stripe PaymentIntent for an existing booking and returns the
// client secret the frontend needs to mount Stripe Elements.
async function createPaymentIntent(req, res, next) {
  try {
    const { bookingId } = req.body;

    const booking = await findBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this booking.' });
    }
    if (booking.payment_status === 'paid') {
      return res.status(409).json({ error: 'This booking has already been paid.' });
    }

    // Stripe expects the smallest currency unit (cents), not dollars.
    const amountInCents = Math.round(Number(booking.price) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: String(booking.id),
        userId: String(req.user.id),
      },
      // Lets Stripe Elements offer whichever payment methods are enabled
      // on the dashboard (card, etc.) without listing them manually here.
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/webhook  (Stripe only — verified via signature, no auth middleware)
// Stripe calls this directly when a payment's status changes. This is the
// authoritative source of truth for "did the payment actually succeed" —
// never trust the frontend alone to report that, since a person could close
// the tab right after paying but before the frontend confirms it.
async function handleWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be the raw, unparsed buffer here — signature verification
    // fails on a JSON-parsed body, which is why this route is wired with
    // express.raw() instead of express.json() (see app.js).
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata?.bookingId;

    if (bookingId) {
      try {
        await updateBookingPayment(bookingId, 'paid', paymentIntent.id);
      } catch (err) {
        console.error(`Failed to mark booking ${bookingId} as paid:`, err);
        // Still return 200 — Stripe retries on non-2xx, and retrying won't
        // fix a DB error. Log it for manual follow-up instead.
      }
    }
  }

  res.json({ received: true });
}

module.exports = { createPaymentIntent, handleWebhook };
