"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getComplianceStatusAction,
  getUserExportsAction,
  processUserExportAction,
  anonymizeUserAction,
  getAuditLogsAction,
  generateComplianceReportAction,
} from "@/features/admin/services/admin.actions";
import {
  toAdminUserExportView,
  toAdminAuditLogView,
  type AdminUserExportView,
  type AdminAuditLogView,
} from "@/features/admin/converters/admin.converter";
import {
  AdminPageHeader,
  AdminTabs,
  AdminTable,
  Badge,
  ActionButton,
  ErrorDisplay,
  LoadingSpinner,
  EmptyState,
  confirmAction,
  promptText,
} from "@/features/admin/components/AdminShared";

const TABS = ["Statut PIPEDA", "Demandes exports", "Logs d'audit"] as const;
type Tab = typeof TABS[number];

interface ComplianceStatus {
  pipedaCompliant: boolean;
  lastAuditDate: string;
  pendingRequests: number;
  anonymizedAccounts: number;
  dataRetentionDays: number;
  encryptionEnabled: boolean;
}

export default function AdminCompliancePage() {
  const [tab, setTab]           = useState<Tab>("Statut PIPEDA");
  const [status, setStatus]     = useState<ComplianceStatus | null>(null);
  const [exports, setExports]   = useState<AdminUserExportView[]>([]);
  const [logs, setLogs]         = useState<AdminAuditLogView[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy]         = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, e, l] = await Promise.all([
        getComplianceStatusAction(),
        getUserExportsAction(),
        getAuditLogsAction(),
      ]);
      setStatus(s as unknown as ComplianceStatus);
      setExports((e as Parameters<typeof toAdminUserExportView>[0][]).map(toAdminUserExportView));
      setLogs((l as Parameters<typeof toAdminAuditLogView>[0][]).map(toAdminAuditLogView));
    } catch (e) {
      setError((e as Error).message ?? "Impossible de charger la conformitÃ©");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleProcess(exportId: string) {
    if (!await confirmAction("Traiter cette demande d'export PIPEDA ?")) return;
    setBusy(exportId); setFeedback(null);
    try {
      await processUserExportAction(exportId);
      setFeedback("âœ… Demande traitÃ©e.");
      await load();
    } catch (e) { setFeedback(`âŒ ${(e as Error).message}`); }
    finally { setBusy(null); }
  }

  async function handleAnonymize() {
    const userId = await promptText("ID de l'utilisateur Ã  anonymiser :");
    if (!userId) return;
    if (!await confirmAction(`Anonymiser dÃ©finitivement l'utilisateur ${userId} ? Cette action est irrÃ©versible.`)) return;
    setBusy("anon"); setFeedback(null);
    try {
      await anonymizeUserAction(userId);
      setFeedback("âœ… Compte anonymisÃ©.");
    } catch (e) { setFeedback(`âŒ ${(e as Error).message}`); }
    finally { setBusy(null); }
  }

  async function handleReport() {
    setBusy("report"); setFeedback(null);
    try {
      await generateComplianceReportAction();
      setFeedback("âœ… Rapport de conformitÃ© gÃ©nÃ©rÃ©.");
    } catch (e) { setFeedback(`âŒ ${(e as Error).message}`); }
    finally { setBusy(null); }
  }

  const Check = ({ ok }: { ok: boolean }) => (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${ok ? "text-green-600" : "text-red-500"}`}>
      <span>{ok ? "âœ“" : "âœ—"}</span>
      <span>{ok ? "Conforme" : "Non conforme"}</span>
    </span>
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="ConformitÃ© PIPEDA"
        subtitle="Gestion de la protection des donnÃ©es personnelles"
        action={
          <div className="flex gap-2">
            <ActionButton label="Anonymiser un compte" onClick={handleAnonymize} disabled={busy === "anon"} />
            <ActionButton label="GÃ©nÃ©rer rapport" onClick={handleReport} disabled={busy === "report"} variant="primary" />
            <ActionButton label="â†º" onClick={load} disabled={loading} />
          </div>
        }
      />

      {feedback && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${
          feedback.startsWith("âœ…") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {feedback}
        </div>
      )}

      {error && <ErrorDisplay message={error} onRetry={load} />}

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as Tab)} />

      {tab === "Statut PIPEDA" && (
        loading && !status ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : status ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statut global */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 col-span-full md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Statut de conformitÃ© globale</h3>
                <Check ok={status.pipedaCompliant} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {[
                  { label: "Dernier audit", value: new Date(status.lastAuditDate).toLocaleDateString("fr-CA") },
                  { label: "Demandes en attente", value: String(status.pendingRequests) },
                  { label: "Comptes anonymisÃ©s", value: String(status.anonymizedAccounts) },
                  { label: "RÃ©tention donnÃ©es", value: `${status.dataRetentionDays} jours` },
                  { label: "Chiffrement", value: status.encryptionEnabled ? "ActivÃ©" : "DÃ©sactivÃ©" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      )}

      {tab === "Demandes exports" && (
        <AdminTable
          headers={["Utilisateur", "Type", "DemandÃ© le", "Statut", "Action"]}
          loading={loading}
          empty={!loading && exports.length === 0}
          emptyText="Aucune demande d'export en attente."
        >
          {exports.map((ex) => (
            <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 font-mono text-xs text-slate-600">{ex.userId.slice(0, 8)}â€¦</td>
              <td className="py-3 px-4 text-sm text-slate-700">{ex.exportType}</td>
              <td className="py-3 px-4 text-xs text-slate-400">{ex.requestedAt}</td>
              <td className="py-3 px-4">
                <Badge
                  label={ex.status}
                  color={ex.statusColor as "amber" | "green" | "blue" | "red" | "slate"}
                />
              </td>
              <td className="py-3 px-4">
                {ex.status === "Pending" && (
                  <ActionButton
                    label="Traiter"
                    onClick={() => handleProcess(ex.id)}
                    variant="primary"
                    disabled={busy === ex.id}
                  />
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {tab === "Logs d'audit" && (
        <AdminTable
          headers={["Horodatage", "Action", "Acteur", "Cible", "IP"]}
          loading={loading}
          empty={!loading && logs.length === 0}
          emptyText="Aucun log d'audit."
        >
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{log.timestamp}</td>
              <td className="py-3 px-4 text-sm font-medium text-slate-700">{log.action}</td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">{(log.actorId ?? "").slice(0, 8)}â€¦</td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">{log.targetId ? `${log.targetId.slice(0, 8)}â€¦` : "â€”"}</td>
              <td className="py-3 px-4 font-mono text-xs text-slate-400">{log.ipAddress ?? "â€”"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}


