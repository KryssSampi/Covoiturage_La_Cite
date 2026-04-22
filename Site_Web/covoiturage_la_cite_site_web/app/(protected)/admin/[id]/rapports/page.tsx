'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/core/state/app_state';
import { AdminReportsPanel } from '@/features/admin/components/AdminReportsPanel';

export default function AdminRapportsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appState = useAppState();

  useEffect(() => {
    if (!appState.userConnected) return;
    if (appState.userConnected.role !== 'Admin' || appState.userConnected.id !== params.id) {
      router.replace('/login');
    }
  }, [appState.userConnected, params.id, router]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les signalements soumis par les utilisateurs. Assignez-les et prenez les décisions de modération.
        </p>
      </div>

      <AdminReportsPanel />
    </div>
  );
}
