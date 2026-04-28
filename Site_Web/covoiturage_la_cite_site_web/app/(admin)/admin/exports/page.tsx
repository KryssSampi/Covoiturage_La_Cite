"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getExportsAction,
  createExportAction,
} from "@/features/admin/services/admin.actions";
import {
  toAdminExportView,
  type AdminExportView,
} from "@/features/admin/converters/admin.converter";
import {
  AdminPageHeader,
  AdminTable,
  AdminSelect,
  Badge,
  ActionButton,
  ErrorDisplay,
} from "@/features/admin/components/AdminShared";

const EXPORT_TYPES = ["users", "trips", "finance", "reports", "audit"];
const EXPORT_FORMATS = ["json", "csv", "xlsx"];

export default function AdminExportsPage() {
  const [exports, setExports]   = useState<AdminExportView[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [type, setType]         = useState("users");
  const [format, setFormat]     = useState("csv");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getExportsAction();
      setExports((data as Parameters<typeof toAdminExportView>[0][]).map(toAdminExportView));
    } catch (e) { setError((e as Error).message ?? "Impossible de charger les exports"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleCreate() {
    setCreating(true); setFeedback(null);
    try {
      await createExportAction({ type, format });
      setFeedback("✅ Export lancé — il apparaîtra dans la liste ci-dessous.");
      await load();
    } catch (e) { setFeedback(`❌ ${(e as Error).message}`); }
    finally { setCreating(false); }
  }

  const pending = exports.filter((e) => e.status === "Processing" || e.status === "Pending").length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Exports de données"
        subtitle={`${exports.length} export${exports.length !== 1 ? "s" : ""} · ${pending} en cours`}
        action={<ActionButton label="↺" onClick={load} disabled={loading} />}
      />

      {feedback && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${
          feedback.startsWith("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {feedback}
        </div>
      )}

      {error && <ErrorDisplay message={error} onRetry={load} />}

      {/* Formulaire de création */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Nouvel export</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-500 font-medium">Type de données</label>
            <AdminSelect
              value={type}
              onChange={setType}
              options={EXPORT_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-500 font-medium">Format</label>
            <AdminSelect
              value={format}
              onChange={setFormat}
              options={EXPORT_FORMATS.map((f) => ({ value: f, label: f.toUpperCase() }))}
            />
          </div>
          <ActionButton
            label={creating ? "Lancement…" : "Lancer l'export"}
            onClick={handleCreate}
            variant="primary"
            disabled={creating}
          />
        </div>
      </div>

      {/* Historique */}
      <AdminTable
        headers={["ID", "Type", "Format", "Statut", "Créé le", "Expire le", "Fichier"]}
        loading={loading}
        empty={!loading && exports.length === 0}
        emptyText="Aucun export disponible."
      >
        {exports.map((ex) => (
          <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3 px-4 font-mono text-xs text-slate-400">{ex.id.slice(0, 8)}…</td>
            <td className="py-3 px-4 text-sm text-slate-700 capitalize">{ex.exportType}</td>
            <td className="py-3 px-4">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                {ex.format}
              </span>
            </td>
            <td className="py-3 px-4">
              <Badge
                label={ex.status}
                color={ex.statusColor as "green" | "amber" | "blue" | "red" | "slate"}
              />
            </td>
            <td className="py-3 px-4 text-xs text-slate-400">{ex.createdAt}</td>
            <td className="py-3 px-4 text-xs text-slate-400">{ex.expiresAt ?? "—"}</td>
            <td className="py-3 px-4">
              {ex.downloadUrl ? (
                <a
                  href={ex.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  ↓ Télécharger
                </a>
              ) : (
                <span className="text-xs text-slate-300">—</span>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
