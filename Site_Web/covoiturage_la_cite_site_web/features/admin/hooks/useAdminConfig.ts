'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlatformConfigDto, SetConfigDto } from '@/server/services/AdminService';

interface UseAdminConfigResult {
  configs: PlatformConfigDto[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveKey: (data: SetConfigDto) => Promise<boolean>;
  refresh: () => void;
}

export function useAdminConfig(): UseAdminConfigResult {
  const [configs, setConfigs] = useState<PlatformConfigDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/config');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveKey = useCallback(async (data: SetConfigDto): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      await fetchConfig();
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchConfig]);

  return { configs, loading, saving, error, saveKey, refresh: fetchConfig };
}
