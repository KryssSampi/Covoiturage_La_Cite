'use client';

import { useState } from 'react';
import { useAdminConfig } from '@/features/admin/hooks/useAdminConfig';
import type { PlatformConfigDto } from '@/server/services/AdminService';

function ConfigRow({ config, onSave }: { config: PlatformConfigDto; onSave: (key: string, value: string) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(config.value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(config.key, val);
    setSaving(false);
    if (ok) {
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-mono font-medium text-gray-800">{config.key}</p>
        {config.description && (
          <p className="text-xs text-gray-400 mt-0.5">{config.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full text-sm border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
        ) : (
          <span className={`text-sm font-mono ${saved ? 'text-green-600' : 'text-gray-700'}`}>
            {config.value}
            {saved && ' ✓'}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
        {new Date(config.updatedAt).toLocaleDateString('fr-CA')}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? '…' : 'Sauver'}
            </button>
            <button
              onClick={() => { setEditing(false); setVal(config.value); }}
              className="text-xs text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium"
          >
            Modifier
          </button>
        )}
      </td>
    </tr>
  );
}

export function AdminConfigPanel() {
  const { configs, loading, error, saveKey, refresh } = useAdminConfig();
  const [searchKey, setSearchKey] = useState('');

  const filtered = configs.filter((c) =>
    c.key.toLowerCase().includes(searchKey.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Rechercher une clé de configuration…"
          className="flex-1 max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={refresh}
          className="text-xs text-blue-500 hover:underline"
        >
          🔄 Actualiser
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">Chargement de la configuration…</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Clé</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valeur</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Modifié le</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    Aucune configuration trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((config) => (
                  <ConfigRow
                    key={config.key}
                    config={config}
                    onSave={(key, value) => saveKey({ key, value })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
