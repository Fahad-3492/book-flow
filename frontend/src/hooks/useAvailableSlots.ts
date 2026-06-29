import { useState, useEffect } from 'react';
import type { AvailableSlotsResponse } from '../types';
import { apiRequest } from '../lib/api';

interface UseAvailableSlotsResult {
  slots: string[];
  isLoading: boolean;
  error: string | null;
}

export function useAvailableSlots(serviceId: number | undefined, date: string): UseAvailableSlotsResult {
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !date) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ serviceId: String(serviceId), date });

    apiRequest<AvailableSlotsResponse>(`/bookings/available-slots?${params}`)
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load available times.');
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, date]);

  return { slots, isLoading, error };
}
