'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/core/state/app_state';
import { AdminConfigPanel } from '@/features/admin/components/AdminConfigPanel';

export default function AdminConfigurationPage({ params }: { params: { id: string } }) {
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
        <h1 className="text-2xl font-bold text-gray-900">Configuration de la plateforme</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modifiez les paramètres globaux de la plateforme. Les changements sont appliqués immédiatement.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <span className="mt-0.5">⚠️</span>
        <span>
          Attention : toute modification de configuration est irréversible et affecte l&apos;ensemble des utilisateurs.
          Assurez-vous de valider les changements avant de les sauvegarder.
        </span>
      </div>

      <AdminConfigPanel />
    </div>
  );
}
