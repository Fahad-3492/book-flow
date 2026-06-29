import { loadStripe } from '@stripe/stripe-js';

// loadStripe() is meant to be called once and reused — calling it on every
// render would re-fetch Stripe.js unnecessarily. Module-level singleton.
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
