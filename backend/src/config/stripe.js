const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  // Fail loudly at startup rather than letting every payment route 500 later.
  console.warn('STRIPE_SECRET_KEY is not set — payment routes will fail.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

module.exports = stripe;
