'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuditLogDto } from '@/server/services/AdminService';

interface UseAdminAuditResult {
  logs: AuditLogDto[];
  loading: boolean;
  error: string | null;
  count: number;
  setCount: (count: number) => void;
  refresh: () => void;
}

export function useAdminAudit(initialCount = 100): UseAdminAuditResult {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(initialCount);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit-logs?count=${count}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, count, setCount, refresh: fetchLogs };
}
