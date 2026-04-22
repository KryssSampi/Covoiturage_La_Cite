'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReportAdminDto } from '@/server/services/AdminService';

type ReportStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Dismissed' | '';

interface UseAdminReportsResult {
  reports: ReportAdminDto[];
  loading: boolean;
  error: string | null;
  statusFilter: ReportStatus;
  setStatusFilter: (status: ReportStatus) => void;
  assign: (reportId: string) => Promise<boolean>;
  resolve: (reportId: string, resolution: string, action?: string) => Promise<boolean>;
  refresh: () => void;
}

export function useAdminReports(): UseAdminReportsResult {
  const [reports, setReports] = useState<ReportAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus>('Pending');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? `/api/admin/reports?status=${statusFilter}`
        : '/api/admin/reports';
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setReports(Array.isArray(data) ? data : data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const assign = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/assign`, { method: 'POST' });
      if (!res.ok) return false;
      await fetchReports();
      return true;
    } catch {
      return false;
    }
  }, [fetchReports]);

  const resolve = useCallback(async (
    reportId: string,
    resolution: string,
    action?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, action }),
      });
      if (!res.ok) return false;
      await fetchReports();
      return true;
    } catch {
      return false;
    }
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    assign,
    resolve,
    refresh: fetchReports,
  };
}
