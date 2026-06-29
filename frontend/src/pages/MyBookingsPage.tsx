import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { LoadingState, ErrorState, EmptyState } from '../components/StateDisplays';
import { formatPrice, formatDuration } from '../lib/format';
import type { Booking } from '../types';

const STATUS_STYLES: Record<Booking['status'], string> = {
  pending: 'text-amber bg-amber/10 border-amber/30',
  confirmed: 'text-sage bg-sage/10 border-sage/30',
  cancelled: 'text-rust bg-rust/10 border-rust/30',
  completed: 'text-offwhite/60 bg-white/5 border-white/10',
};

export function MyBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiRequest<{ bookings: Booking[] }>('/bookings/my', { token })
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bookings.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (!token) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-offwhite mb-3">My bookings</h1>
        <p className="text-offwhite/60">
          <Link to="/login" className="text-amber hover:underline">
            Log in
          </Link>{' '}
          to see your bookings.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-offwhite mb-8">My bookings</h1>

      {isLoading && <LoadingState label="Loading your bookings…" />}
      {error && <ErrorState message={error} />}

      {!isLoading && !error && bookings.length === 0 && (
        <EmptyState
          title="No bookings yet."
          hint="Browse services and pick a time that works for you."
        />
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const dt = new Date(booking.booking_datetime);
            return (
              <div
                key={booking.id}
                className="bg-charcoal-raised border border-white/10 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <h3 className="font-display text-xl text-offwhite mb-1">
                    {booking.service_name}
                  </h3>
                  <p className="text-sm text-offwhite/60">
                    {dt.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-sage mt-1">
                    {formatDuration(booking.duration_minutes)} · {formatPrice(booking.price)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
