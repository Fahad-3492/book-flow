import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { useService } from '../hooks/useService';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useAuth } from '../context/AuthContext';
import { DatePicker } from '../components/DatePicker';
import { SlotGrid } from '../components/SlotGrid';
import { CheckoutForm } from '../components/CheckoutForm';
import { LoadingState, ErrorState } from '../components/StateDisplays';
import { formatPrice, formatDuration, getTodayDateStr, formatDateLong } from '../lib/format';
import { apiRequest, ApiRequestError } from '../lib/api';
import { stripePromise } from '../lib/stripe';
import type { Booking, PaymentIntentResponse } from '../types';

export function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const { service, isLoading: serviceLoading, error: serviceError, notFound } = useService(id);

  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Payment step state — only relevant once a booking exists.
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'loading' | 'ready' | 'paid' | 'skipped'>('idle');
  const [paymentSetupError, setPaymentSetupError] = useState<string | null>(null);

  const { slots, isLoading: slotsLoading, error: slotsError } = useAvailableSlots(
    service?.id,
    selectedDate
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null); // a slot from a different day is no longer valid
    setBookingError(null);
  }

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot);
    setBookingError(null);
  }

  async function handleConfirmBooking() {
    if (!service || !selectedSlot) return;

    if (!user || !token) {
      // Send them to log in, then back here once they're authenticated.
      navigate('/login', { state: { from: `/services/${service.id}` } });
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const data = await apiRequest<{ booking: Booking }>('/bookings', {
        method: 'POST',
        token,
        body: {
          serviceId: service.id,
          date: selectedDate,
          time: selectedSlot,
          notes: notes.trim() || undefined,
        },
      });
      setConfirmedBooking(data.booking);
      await startPayment(data.booking, token);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        // Someone else took the slot between page load and submit — the
        // backend's double-booking guard caught it. Refresh slots so the
        // grid reflects reality instead of letting them retry blindly.
        setBookingError('That time was just booked by someone else. Pick another slot below.');
        setSelectedSlot(null);
      } else {
        setBookingError(err instanceof Error ? err.message : 'Could not complete the booking.');
      }
    } finally {
      setIsBooking(false);
    }
  }

  // Fetches a Stripe PaymentIntent client secret for the just-created booking.
  // Failure here doesn't undo the booking — it's already saved as pending —
  // it just means the person sees a "pay later" path instead of a card form.
  async function startPayment(booking: Booking, authToken: string) {
    setPaymentStep('loading');
    setPaymentSetupError(null);
    try {
      const data = await apiRequest<PaymentIntentResponse>('/payments/create-intent', {
        method: 'POST',
        token: authToken,
        body: { bookingId: booking.id },
      });
      setClientSecret(data.clientSecret);
      setPaymentStep('ready');
    } catch (err) {
      setPaymentSetupError(
        err instanceof Error ? err.message : 'Could not set up payment right now.'
      );
      setPaymentStep('idle');
    }
  }

  if (notFound) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="text-amber text-sm hover:underline">
          ← Back to all services
        </Link>
        <h1 className="font-display text-3xl text-offwhite mt-6">Service not found</h1>
        <p className="text-offwhite/60 mt-2">
          This service may have been removed. Take a look at what's currently available.
        </p>
      </main>
    );
  }

  if (serviceLoading) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <LoadingState label="Loading service…" />
      </main>
    );
  }

  if (serviceError || !service) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <ErrorState message={serviceError || 'Something went wrong.'} />
      </main>
    );
  }

  // Booking confirmed — show the payment step (or a pay-later path).
  if (confirmedBooking) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-charcoal-raised border border-sage/30 rounded-2xl p-8">
          <p className="text-sage text-sm uppercase tracking-widest mb-3 text-center">
            Booking requested
          </p>
          <h1 className="font-display text-3xl text-offwhite mb-4 text-center">
            {service.name} on {formatDateLong(selectedDate)} at {selectedSlot}
          </h1>

          {paymentStep === 'paid' || paymentStep === 'skipped' ? (
            <>
              <p className="text-offwhite/60 mb-6 text-center">
                {paymentStep === 'paid'
                  ? 'Payment received. Your spot is confirmed pending final approval.'
                  : "We've saved your spot as pending. You can pay any time before your appointment."}
              </p>
              <Link
                to="/my-bookings"
                className="block text-center bg-amber hover:bg-amber-bright text-charcoal font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                View my bookings
              </Link>
            </>
          ) : (
            <>
              <p className="text-offwhite/60 mb-6 text-center">
                {formatPrice(service.price)} due now to secure your spot.
              </p>

              {paymentStep === 'loading' && <LoadingState label="Setting up payment…" />}
              {paymentSetupError && <ErrorState message={paymentSetupError} />}

              {paymentStep === 'ready' && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#D4632C',
                        colorBackground: '#23262A',
                        colorText: '#F7F5F0',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    amount={service.price}
                    onSuccess={() => setPaymentStep('paid')}
                    onSkip={() => setPaymentStep('skipped')}
                  />
                </Elements>
              )}

              {paymentSetupError && (
                <button
                  onClick={() => setPaymentStep('skipped')}
                  className="w-full mt-2 text-offwhite/50 hover:text-offwhite/80 text-sm py-2 transition-colors"
                >
                  Continue without paying now
                </button>
              )}
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link to="/" className="text-amber text-sm hover:underline">
        ← Back to all services
      </Link>

      <h1 className="font-display text-4xl text-offwhite mt-6 mb-2">{service.name}</h1>
      {service.description && <p className="text-offwhite/60 mb-3">{service.description}</p>}
      <div className="flex items-center gap-3 text-sm text-sage mb-10">
        <span>{formatDuration(service.duration_minutes)}</span>
        <span className="w-1 h-1 rounded-full bg-sage/40" />
        <span>{formatPrice(service.price)}</span>
      </div>

      <h2 className="text-sm uppercase tracking-widest text-offwhite/50 mb-3">Pick a date</h2>
      <DatePicker selectedDate={selectedDate} onSelectDate={handleSelectDate} />

      <h2 className="text-sm uppercase tracking-widest text-offwhite/50 mt-8 mb-3">
        Available times — {formatDateLong(selectedDate)}
      </h2>
      {slotsLoading && <LoadingState label="Checking availability…" />}
      {slotsError && <ErrorState message={slotsError} />}
      {!slotsLoading && !slotsError && (
        <SlotGrid slots={slots} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot} />
      )}

      {/* Lives outside the selectedSlot block below: a 409 clears the selected
          slot so the person can pick a fresh one, but the explanation of why
          must stay visible — otherwise the error message vanishes the instant
          it's set, in the same render pass that hides it. */}
      {bookingError && <div className="mt-4"><ErrorState message={bookingError} /></div>}

      {selectedSlot && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <label htmlFor="notes" className="block text-sm text-offwhite/70 mb-1.5">
            Anything we should know? (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full bg-charcoal-raised border border-white/10 rounded-lg px-3.5 py-2.5 text-offwhite focus-visible:border-amber outline-none resize-none"
          />

          <button
            onClick={handleConfirmBooking}
            disabled={isBooking}
            className="w-full mt-4 bg-amber hover:bg-amber-bright disabled:opacity-50 text-charcoal font-semibold py-3 rounded-xl transition-colors"
          >
            {isBooking
              ? 'Booking…'
              : user
                ? `Confirm ${formatDateLong(selectedDate)} at ${selectedSlot}`
                : 'Log in to confirm booking'}
          </button>

          <p className="text-xs text-offwhite/40 mt-2 text-center">
            You'll pay on the next screen — this step just reserves your slot.
          </p>
        </div>
      )}
    </main>
  );
}
