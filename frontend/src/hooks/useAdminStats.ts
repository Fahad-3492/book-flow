import { useState, useEffect } from 'react';
import type { DashboardStats } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function useAdminStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiRequest<{ stats: DashboardStats }>('/admin/stats', { token })
      .then((data) => setStats(data.stats))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { stats, isLoading, error };
}
