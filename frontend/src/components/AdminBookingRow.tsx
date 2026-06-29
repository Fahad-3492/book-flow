import { useState } from 'react';
import type { Booking } from '../types';
import { formatPrice, formatDuration } from '../lib/format';

interface AdminBookingRowProps {
  booking: Booking;
  onUpdateStatus: (status: Booking['status']) => Promise<void>;
}

const STATUS_STYLES: Record<Booking['status'], string> = {
  pending: 'text-amber bg-amber/10 border-amber/30',
  confirmed: 'text-sage bg-sage/10 border-sage/30',
  cancelled: 'text-rust bg-rust/10 border-rust/30',
  completed: 'text-offwhite/60 bg-white/5 border-white/10',
};

const NEXT_ACTIONS: Record<Booking['status'], { label: string; status: Booking['status'] }[]> = {
  pending: [
    { label: 'Confirm', status: 'confirmed' },
    { label: 'Cancel', status: 'cancelled' },
  ],
  confirmed: [
    { label: 'Mark completed', status: 'completed' },
    { label: 'Cancel', status: 'cancelled' },
  ],
  cancelled: [],
  completed: [],
};

export function AdminBookingRow({ booking, onUpdateStatus }: AdminBookingRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const dt = new Date(booking.booking_datetime);

  async function handleAction(status: Booking['status']) {
    setIsUpdating(true);
    try {
      await onUpdateStatus(status);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="bg-charcoal-raised border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display text-lg text-offwhite truncate">{booking.service_name}</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[booking.status]}`}
          >
            {booking.status}
          </span>
        </div>
        <p className="text-sm text-offwhite/60">
          {booking.customer_name} · {booking.customer_email}
        </p>
        <p className="text-sm text-offwhite/50 mt-0.5">
          {dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
          {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} ·{' '}
          {formatDuration(booking.duration_minutes)} · {formatPrice(booking.price)}
          {booking.payment_status === 'paid' && <span className="text-sage"> · Paid</span>}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        {NEXT_ACTIONS[booking.status].map((action) => (
          <button
            key={action.status}
            onClick={() => handleAction(action.status)}
            disabled={isUpdating}
            className={`text-sm font-medium px-3.5 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
              action.status === 'cancelled'
                ? 'border-rust/30 text-rust hover:bg-rust/10'
                : 'border-amber/40 text-amber hover:bg-amber/10'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
