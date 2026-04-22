'use client';

import { useState } from 'react';
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit';

const ENTITY_ICONS: Record<string, string> = {
  User: '👤', Trip: '🚗', Reservation: '🎫', Transaction: '💳',
  Review: '⭐', Report: '🚩', Vehicle: '🚙', Badge: '🏅',
  Certificate: '🔐', AuthSession: '🔑', SosAlert: '🆘',
};

export function AdminAuditPanel() {
  const { logs, loading, error, count, setCount, refresh } = useAdminAudit(100);
  const [search, setSearch] = useState('');

  const filtered = logs.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType.toLowerCase().includes(search.toLowerCase()) ||
    log.actorId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher action, entité, acteur…"
          className="flex-1 max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value={50}>50 entrées</option>
          <option value={100}>100 entrées</option>
          <option value={250}>250 entrées</option>
          <option value={500}>500 entrées</option>
        </select>
        <button
          onClick={refresh}
          className="text-xs text-blue-500 hover:underline"
        >
          🔄 Actualiser
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} entrée{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">Chargement du journal d&apos;audit…</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entité</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acteur</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID Entité</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Aucune entrée trouvée.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(log.createdAt).toLocaleString('fr-CA', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <span>{ENTITY_ICONS[log.entityType] ?? '📄'}</span>
                          <span className="text-gray-700 text-xs">{log.entityType}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500 max-w-[120px] truncate">
                        {log.actorId}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400">
                        {log.details?.includes('ip:') ? log.details.split('ip:')[1]?.split(',')[0]?.trim() : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400 max-w-[120px] truncate">
                        {log.entityId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
