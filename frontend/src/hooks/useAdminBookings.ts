import { useState, useEffect, useCallback } from 'react';
import type { Booking } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useAdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    apiRequest<{ bookings: Booking[] }>('/admin/bookings', { token })
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bookings.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function updateStatus(bookingId: number, status: Booking['status']) {
    if (!token) return;
    await apiRequest(`/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    });
    // Update locally instead of refetching everything — snappier for the
    // common case of clicking through several bookings in a row.
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  }

  return { bookings, isLoading, error, refetch, updateStatus };
}
