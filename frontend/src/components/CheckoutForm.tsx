import { useState, type FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { formatPrice } from '../lib/format';

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onSkip: () => void;
}

export function CheckoutForm({ amount, onSuccess, onSkip }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js hasn't finished loading yet

    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // stay on this page instead of bouncing to Stripe's hosted page
    });

    if (stripeError) {
      // Card errors are meant to be shown to the customer as-is — Stripe
      // writes these messages for end users, unlike most API error strings.
      setError(stripeError.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {error && (
        <p className="text-rust text-sm mt-3" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-5 bg-amber hover:bg-amber-bright disabled:opacity-50 text-charcoal font-semibold py-3 rounded-xl transition-colors"
      >
        {isProcessing ? 'Processing…' : `Pay ${formatPrice(amount)}`}
      </button>

      <button
        type="button"
        onClick={onSkip}
        disabled={isProcessing}
        className="w-full mt-2 text-offwhite/50 hover:text-offwhite/80 text-sm py-2 transition-colors"
      >
        Pay later instead
      </button>
    </form>
  );
}
