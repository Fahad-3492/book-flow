import { useState, useEffect, useCallback } from 'react';
import type { Service } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface ServiceFormInput {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export function useAdminServices() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    apiRequest<{ services: Service[] }>('/admin/services', { token })
      .then((data) => setServices(data.services))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load services.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createService(input: ServiceFormInput) {
    if (!token) return;
    const data = await apiRequest<{ service: Service }>('/admin/services', {
      method: 'POST',
      token,
      body: input,
    });
    setServices((prev) => [data.service, ...prev]);
  }

  async function updateService(id: number, input: Partial<ServiceFormInput> & { isActive?: boolean }) {
    if (!token) return;
    const data = await apiRequest<{ service: Service }>(`/admin/services/${id}`, {
      method: 'PATCH',
      token,
      body: input,
    });
    setServices((prev) => prev.map((s) => (s.id === id ? data.service : s)));
  }

  async function deactivateService(id: number) {
    if (!token) return;
    await apiRequest(`/admin/services/${id}`, { method: 'DELETE', token });
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: false } : s)));
  }

  return { services, isLoading, error, refetch, createService, updateService, deactivateService };
}
