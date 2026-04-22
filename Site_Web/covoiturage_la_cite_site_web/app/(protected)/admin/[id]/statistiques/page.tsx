'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/core/state/app_state';
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard';
import { AdminDashboardStats } from '@/features/admin/components/AdminDashboardStats';

export default function AdminStatistiquesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appState = useAppState();

  useEffect(() => {
    if (!appState.userConnected) return;
    if (appState.userConnected.role !== 'Admin' || appState.userConnected.id !== params.id) {
      router.replace('/login');
    }
  }, [appState.userConnected, params.id, router]);

  const { stats, loading, error, refresh } = useAdminDashboard();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques de la plateforme</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vue globale en temps réel — recalculé toutes les heures par Hangfire
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          🔄 Actualiser
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          Impossible de charger les statistiques : {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <AdminDashboardStats stats={stats} />

          {/* Métriques détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Répartition des utilisateurs</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Conducteurs</span>
                    <span className="font-medium text-blue-600">
                      {stats.totalDrivers} ({((stats.totalDrivers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.totalDrivers / Math.max(stats.totalUsers, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Passagers</span>
                    <span className="font-medium text-green-600">
                      {stats.totalUsers - stats.totalDrivers} ({(((stats.totalUsers - stats.totalDrivers) / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${((stats.totalUsers - stats.totalDrivers) / Math.max(stats.totalUsers, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Activité des trajets</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Trajets actifs</span>
                    <span className="font-medium text-orange-600">{stats.activeTrips}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.activeTrips / Math.max(stats.totalTrips, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Réservations totales</span>
                    <span className="font-medium text-purple-600">{stats.totalReservations.toLocaleString('fr-CA')}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.totalReservations / Math.max(stats.totalTrips * 4, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact écologique */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
            <h2 className="text-base font-semibold text-emerald-800 mb-3">🌿 Impact environnemental</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.co2Saved >= 1000 ? `${(stats.co2Saved / 1000).toFixed(2)} t` : `${stats.co2Saved.toFixed(0)} kg`}
                </p>
                <p className="text-xs text-emerald-700 mt-1">CO₂ total économisé</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {Math.floor(stats.co2Saved / 20)}
                </p>
                <p className="text-xs text-emerald-700 mt-1">Équivalent arbres plantés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.totalTrips > 0 ? (stats.co2Saved / stats.totalTrips).toFixed(1) : '0'} kg
                </p>
                <p className="text-xs text-emerald-700 mt-1">CO₂ moyen par trajet</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
