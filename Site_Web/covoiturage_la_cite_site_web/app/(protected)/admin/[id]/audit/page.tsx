'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/core/state/app_state';
import { AdminAuditPanel } from '@/features/admin/components/AdminAuditPanel';

export default function AdminAuditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appState = useAppState();

  useEffect(() => {
    if (!appState.userConnected) return;
    if (appState.userConnected.role !== 'Admin' || appState.userConnected.id !== params.id) {
      router.replace('/login');
    }
  }, [appState.userConnected, params.id, router]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Journal d&apos;audit</h1>
        <p className="text-sm text-gray-500 mt-1">
          Traçabilité complète de toutes les actions sensibles effectuées sur la plateforme.
          Conservation : 7 ans (conformité PIPEDA).
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
        <span className="mt-0.5">🔒</span>
        <span>
          Ces journaux sont immuables — écriture seule. Ils ne peuvent pas être modifiés ou supprimés.
        </span>
      </div>

      <AdminAuditPanel />
    </div>
  );
}
