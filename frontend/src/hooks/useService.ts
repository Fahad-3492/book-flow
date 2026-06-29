import { useState, useEffect } from 'react';
import type { Service } from '../types';
import { apiRequest, ApiRequestError } from '../lib/api';

interface UseServiceResult {
  service: Service | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useService(id: string | undefined): UseServiceResult {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    apiRequest<{ service: Service }>(`/services/${id}`)
      .then((data) => {
        if (!cancelled) setService(data.service);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiRequestError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load service.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { service, isLoading, error, notFound };
}
