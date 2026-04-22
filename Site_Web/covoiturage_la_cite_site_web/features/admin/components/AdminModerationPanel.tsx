'use client';

import { useState } from 'react';

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

interface AdminModerationPanelProps {
  users: UserRow[];
  onRefresh: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  Active:    'bg-green-100 text-green-700',
  Suspended: 'bg-yellow-100 text-yellow-700',
  Deleted:   'bg-red-100 text-red-700',
  Inactive:  'bg-gray-100 text-gray-500',
};

type ActionType = 'suspend' | 'unsuspend' | 'ban';

export function AdminModerationPanel({ users, onRefresh }: AdminModerationPanelProps) {
  const [search, setSearch] = useState('');
  const [actionTarget, setActionTarget] = useState<{ userId: string; type: ActionType } | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  });

  const handleAction = async () => {
    if (!actionTarget) return;
    if ((actionTarget.type === 'suspend' || actionTarget.type === 'ban') && !reason.trim()) return;

    setProcessing(true);
    try {
      const endpoint = `/api/admin/users/${actionTarget.userId}/${actionTarget.type}`;
      const body =
        actionTarget.type === 'unsuspend'
          ? undefined
          : JSON.stringify({ reason });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });

      const data = await res.json().catch(() => ({}));
      setFeedback({
        msg: res.ok ? data.message ?? 'Action effectuée avec succès.' : data.error ?? 'Erreur.',
        ok: res.ok,
      });
      if (res.ok) {
        setActionTarget(null);
        setReason('');
        onRefresh();
      }
    } catch {
      setFeedback({ msg: 'Erreur réseau.', ok: false });
    } finally {
      setProcessing(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const ACTION_LABELS: Record<ActionType, { label: string; color: string; needReason: boolean }> = {
    suspend:   { label: 'Suspendre', color: 'text-yellow-600 hover:bg-yellow-50', needReason: true },
    unsuspend: { label: 'Réactiver', color: 'text-green-600 hover:bg-green-50', needReason: false },
    ban:       { label: 'Bannir',    color: 'text-red-600 hover:bg-red-50',    needReason: true },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="flex-1 max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={onRefresh} className="text-xs text-blue-500 hover:underline">
          🔄 Actualiser
        </button>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {feedback && (
        <div
          className={`text-sm px-4 py-2 rounded-lg border ${
            feedback.ok
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Formulaire de confirmation */}
      {actionTarget && (
        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Confirmer : {ACTION_LABELS[actionTarget.type].label} l&apos;utilisateur
          </p>
          {ACTION_LABELS[actionTarget.type].needReason && (
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motif (obligatoire)…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAction}
              disabled={processing || (ACTION_LABELS[actionTarget.type].needReason && !reason.trim())}
              className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {processing ? 'En cours…' : 'Confirmer'}
            </button>
            <button
              onClick={() => { setActionTarget(null); setReason(''); }}
              className="text-sm text-gray-500 px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrit le</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'Driver'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[user.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('fr-CA')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {user.status === 'Active' && user.role !== 'Admin' && (
                          <>
                            <button
                              onClick={() => setActionTarget({ userId: user.id, type: 'suspend' })}
                              className="text-xs px-2 py-1 rounded-lg text-yellow-600 hover:bg-yellow-50 border border-yellow-200 transition-colors"
                            >
                              Suspendre
                            </button>
                            <button
                              onClick={() => setActionTarget({ userId: user.id, type: 'ban' })}
                              className="text-xs px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                            >
                              Bannir
                            </button>
                          </>
                        )}
                        {user.status === 'Suspended' && (
                          <button
                            onClick={() => setActionTarget({ userId: user.id, type: 'unsuspend' })}
                            className="text-xs px-2 py-1 rounded-lg text-green-600 hover:bg-green-50 border border-green-200 transition-colors"
                          >
                            Réactiver
                          </button>
                        )}
                        {user.role === 'Admin' && (
                          <span className="text-xs text-gray-400 italic">Protégé</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
