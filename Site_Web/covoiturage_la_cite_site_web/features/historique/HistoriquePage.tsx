'use client';

import { useEffect, useState, useCallback } from 'react';

export interface HistoriqueEntry {
  id: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  duration: number | null;
  price: number;
  status: string;
  doneDate?: string | null;
  isImminent?: boolean;
  // driver view
  maxPassengers?: number;
  passengers?: unknown[];
  pendingRequests?: number;
  driverId?: string;
  // passenger view
  driver?: {
    id: string;
    name: string;
    pictureUrl: string;
    rating: number;
    tripsCount: number;
  };
}

type Role = 'driver' | 'passenger';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Terminé', color: 'text-green-700', bg: 'bg-green-50' },
  cancelled: { label: 'Annulé', color: 'text-red-700', bg: 'bg-red-50' },
  'no-show': { label: 'Absent', color: 'text-orange-700', bg: 'bg-orange-50' },
  'in-progress': { label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-50' },
  published: { label: 'Publié', color: 'text-gray-700', bg: 'bg-gray-100' },
  default: { label: 'Inconnu', color: 'text-gray-500', bg: 'bg-gray-100' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? STATUS_LABELS.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
      {s.label}
    </span>
  );
}

function HistoriqueCard({ entry, role }: { entry: HistoriqueEntry; role: Role }) {
  const date = entry.date
    ? new Date(entry.date).toLocaleDateString('fr-CA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow space-y-3">
      {/* Route */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900 truncate">{entry.departure}</span>
            <span className="text-gray-400 flex-shrink-0">→</span>
            <span className="font-semibold text-gray-900 truncate">{entry.destination}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{date}</span>
            {entry.time && <span>{entry.time}</span>}
            {entry.duration && <span>{Math.round(entry.duration)} min</span>}
          </div>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Info selon le rôle */}
      <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-50">
        {role === 'driver' ? (
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              {Array.isArray(entry.passengers) ? entry.passengers.length : 0}/{entry.maxPassengers ?? '?'} passagers
            </span>
          </div>
        ) : (
          entry.driver && (
            <div className="flex items-center gap-2 text-gray-600">
              {entry.driver.pictureUrl ? (
                <img src={entry.driver.pictureUrl} alt={entry.driver.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#08316e] flex items-center justify-center text-white text-[10px] font-bold">
                  {entry.driver.name?.charAt(0) ?? '?'}
                </div>
              )}
              <span className="truncate max-w-[120px]">{entry.driver.name}</span>
              {entry.driver.rating > 0 && (
                <span className="flex items-center gap-0.5 text-yellow-500 text-xs">
                  ★ {entry.driver.rating.toFixed(1)}
                </span>
              )}
            </div>
          )
        )}
        <span className="font-semibold text-[#08316e]">
          {entry.price > 0 ? `${entry.price.toFixed(2)} $` : 'Gratuit'}
        </span>
      </div>
    </div>
  );
}

export default function HistoriquePage({ userId, role }: { userId: string; role: Role }) {
  const [entries, setEntries] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchHistorique = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = role === 'driver' ? '/api/driver/historique' : '/api/passenger/historique';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Erreur chargement historique');
      const data: HistoriqueEntry[] = await res.json();
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { fetchHistorique(); }, [fetchHistorique]);

  const statuses = ['all', ...Array.from(new Set(entries.map((e) => e.status)))];
  const filtered = statusFilter === 'all' ? entries : entries.filter((e) => e.status === statusFilter);

  const stats = {
    total: entries.length,
    completed: entries.filter((e) => e.status === 'completed').length,
    cancelled: entries.filter((e) => e.status === 'cancelled').length,
    totalEarnings: role === 'driver'
      ? entries.filter((e) => e.status === 'completed').reduce((s, e) => s + (e.price || 0), 0)
      : entries.filter((e) => e.status === 'completed').reduce((s, e) => s + (e.price || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Chargement de l'historique…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={fetchHistorique} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-[#08316e]">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Terminés</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-[#08316e]">{stats.totalEarnings.toFixed(0)} $</p>
          <p className="text-xs text-gray-500 mt-0.5">{role === 'driver' ? 'Gains' : 'Dépenses'}</p>
        </div>
      </div>

      {/* Filtres */}
      {statuses.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {statuses.map((s) => {
            const label = s === 'all' ? 'Tous' : (STATUS_LABELS[s]?.label ?? s);
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  statusFilter === s
                    ? 'bg-[#08316e] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🚗</div>
          <p className="font-medium text-gray-600 text-lg">Aucun trajet</p>
          <p className="text-sm mt-1">
            {statusFilter !== 'all' ? 'Aucun trajet avec ce statut' : 'Votre historique apparaîtra ici'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <HistoriqueCard key={entry.id} entry={entry} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
