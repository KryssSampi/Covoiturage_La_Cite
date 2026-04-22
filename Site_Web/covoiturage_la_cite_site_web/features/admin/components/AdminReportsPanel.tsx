'use client';

import { useState } from 'react';
import { useAdminReports } from '@/features/admin/hooks/useAdminReports';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  InProgress: { label: 'En cours',   color: 'bg-blue-100 text-blue-800' },
  Resolved:  { label: 'Résolu',     color: 'bg-green-100 text-green-800' },
  Dismissed: { label: 'Rejeté',     color: 'bg-gray-100 text-gray-600' },
};

const STATUS_OPTIONS = ['', 'Pending', 'InProgress', 'Resolved', 'Dismissed'] as const;

export function AdminReportsPanel() {
  const { reports, loading, error, statusFilter, setStatusFilter, assign, resolve, refresh } =
    useAdminReports();

  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleAssign = async (reportId: string) => {
    const ok = await assign(reportId);
    setActionMsg(ok ? 'Signalement assigné.' : 'Erreur lors de l\'assignation.');
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleResolve = async (reportId: string) => {
    if (!resolution.trim()) return;
    const ok = await resolve(reportId, resolution);
    setActionMsg(ok ? 'Signalement résolu.' : 'Erreur lors de la résolution.');
    setResolvingId(null);
    setResolution('');
    setTimeout(() => setActionMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Filtrer par statut :</span>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s as typeof statusFilter)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            {s === '' ? 'Tous' : STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
        <button
          onClick={refresh}
          className="ml-auto text-xs text-blue-500 hover:underline"
        >
          🔄 Actualiser
        </button>
      </div>

      {actionMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
          {actionMsg}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-gray-400">Chargement des signalements…</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-10 text-gray-400">Aucun signalement trouvé.</div>
      )}

      <div className="space-y-3">
        {reports.map((report) => {
          const statusInfo = STATUS_LABELS[report.status] ?? { label: report.status, color: 'bg-gray-100 text-gray-600' };
          return (
            <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{report.publicReference}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {report.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-800 line-clamp-2">{report.description}</p>
                  {report.resolution && (
                    <p className="mt-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                      Résolution : {report.resolution}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString('fr-CA', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Actions */}
                {report.status === 'Pending' && (
                  <button
                    onClick={() => handleAssign(report.id)}
                    className="shrink-0 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Prendre en charge
                  </button>
                )}
                {report.status === 'InProgress' && resolvingId !== report.id && (
                  <button
                    onClick={() => setResolvingId(report.id)}
                    className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Résoudre
                  </button>
                )}
              </div>

              {/* Formulaire de résolution */}
              {resolvingId === report.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Décision / résolution…"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    onClick={() => handleResolve(report.id)}
                    disabled={!resolution.trim()}
                    className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => { setResolvingId(null); setResolution(''); }}
                    className="text-xs text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
