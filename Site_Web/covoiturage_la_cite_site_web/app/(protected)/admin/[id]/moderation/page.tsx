'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/core/state/app_state';
import { AdminModerationPanel } from '@/features/admin/components/AdminModerationPanel';

interface UserRow {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  status: string;
  isProfileVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminModerationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appState = useAppState();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appState.userConnected) return;
    if (appState.userConnected.role !== 'Admin' || appState.userConnected.id !== params.id) {
      router.replace('/login');
    }
  }, [appState.userConnected, params.id, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users?pageSize=200');
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modération des comptes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Suspendez, réactivez ou bannissez des comptes utilisateurs. Les comptes Admin sont protégés.
        </p>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">Chargement des utilisateurs…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && (
        <AdminModerationPanel users={users} onRefresh={fetchUsers} />
      )}
    </div>
  );
}
