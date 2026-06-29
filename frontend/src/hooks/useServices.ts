import { useState, useEffect } from 'react';
import type { Service } from '../types';
import { apiRequest } from '../lib/api';

interface UseServicesResult {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ services: Service[] }>('/services')
      .then((data) => {
        if (!cancelled) setServices(data.services);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load services.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // Avoids setting state on an unmounted component if the user navigates
    // away before the fetch resolves.
    return () => {
      cancelled = true;
    };
  }, []);

  return { services, isLoading, error };
}
