'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlatformStatsDto } from '@/server/services/AdminService';

interface UseAdminDashboardResult {
  stats: PlatformStatsDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAdminDashboard(): UseAdminDashboardResult {
  const [stats, setStats] = useState<PlatformStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
