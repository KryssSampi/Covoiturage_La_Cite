"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getModerationQueueAction,
  approveModerationAction,
  removeModerationAction,
  getSignaledMessagesAction,
} from "@/features/admin/services/admin.actions";
import {
  toAdminModerationView,
  type AdminModerationView,
} from "@/features/admin/converters/admin.converter";
import {
  AdminPageHeader,
  AdminTabs,
  AdminTable,
  Badge,
  ActionButton,
  ErrorDisplay,
  EmptyState,
  confirmAction,
  promptText,
} from "@/features/admin/components/AdminShared";

const TABS = ["File de modÃ©ration", "Messages signalÃ©s"] as const;
type Tab = typeof TABS[number];

interface SignaledMessage {
  id: string;
  content: string;
  authorId: string;
  reportCount: number;
  createdAt: string;
}

export default function AdminModerationsPage() {
  const [tab, setTab]             = useState<Tab>("File de modÃ©ration");
  const [queue, setQueue]         = useState<AdminModerationView[]>([]);
  const [messages, setMessages]   = useState<SignaledMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [feedback, setFeedback]   = useState<string | null>(null);
  const [busy, setBusy]           = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, m] = await Promise.all([
        getModerationQueueAction(),
        getSignaledMessagesAction(),
      ]);
      setQueue((q as Parameters<typeof toAdminModerationView>[0][]).map(toAdminModerationView));
      setMessages((m as Array<{ id: string; message?: string; senderId?: string; createdAt: string; }>).map((x) => ({ id: x.id, content: x.message ?? "", authorId: x.senderId ?? "", reportCount: 1, createdAt: x.createdAt })));
    } catch (e) {
      setError((e as Error).message ?? "Impossible de charger la modÃ©ration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleApprove(id: string) {
    if (!await confirmAction("Approuver ce contenu (le conserver) ?")) return;
    setBusy(id); setFeedback(null);
    try {
      await approveModerationAction(id);
      setFeedback("âœ… Contenu approuvÃ©.");
      await load();
    } catch (e) { setFeedback(`âŒ ${(e as Error).message}`); }
    finally { setBusy(null); }
  }

  async function handleRemove(id: string) {
    const reason = await promptText("Raison du retrait :");
    if (!reason) return;
    setBusy(id); setFeedback(null);
    try {
      await removeModerationAction(id, reason);
      setFeedback("âœ… Contenu retirÃ©.");
      await load();
    } catch (e) { setFeedback(`âŒ ${(e as Error).message}`); }
    finally { setBusy(null); }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="ModÃ©ration"
        subtitle={`${queue.length} Ã©lÃ©ment${queue.length !== 1 ? "s" : ""} en attente de dÃ©cision`}
        action={<ActionButton label="â†º" onClick={load} disabled={loading} />}
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

      {tab === "File de modÃ©ration" && (
        <AdminTable
          headers={["Contenu", "Type", "Auteur", "Signalements", "SÃ©vÃ©ritÃ©", "Actions"]}
          loading={loading}
          empty={!loading && queue.length === 0}
          emptyText="La file de modÃ©ration est vide."
        >
          {queue.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 max-w-xs">
                <p className="text-sm text-slate-700 truncate">{item.contentPreview}</p>
              </td>
              <td className="py-3 px-4 text-xs text-slate-500 capitalize">{item.contentType}</td>
              <td className="py-3 px-4 font-mono text-xs text-slate-400">{(item.reportedById ?? "").slice(0, 8)}â€¦</td>
              <td className="py-3 px-4 text-sm font-semibold text-slate-700 text-center">{item.reportCount}</td>
              <td className="py-3 px-4">
                <Badge
                  label={item.severity ?? "Low"}
                  color={item.severityColor as "red" | "amber" | "slate"}
                />
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-1.5">
                  <ActionButton
                    label="âœ“ Conserver"
                    onClick={() => handleApprove(item.id)}
                    variant="success"
                    disabled={busy === item.id}
                  />
                  <ActionButton
                    label="âœ— Retirer"
                    onClick={() => handleRemove(item.id)}
                    variant="danger"
                    disabled={busy === item.id}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {tab === "Messages signalÃ©s" && (
        <AdminTable
          headers={["Message", "Auteur", "Signalements", "Date"]}
          loading={loading}
          empty={!loading && messages.length === 0}
          emptyText="Aucun message signalÃ©."
        >
          {messages.map((msg) => (
            <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 max-w-sm">
                <p className="text-sm text-slate-700 truncate">{msg.content}</p>
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-400">{msg.authorId.slice(0, 8)}â€¦</td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                  msg.reportCount >= 5 ? "bg-red-100 text-red-700" :
                  msg.reportCount >= 2 ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {msg.reportCount}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-slate-400">
                {new Date(msg.createdAt).toLocaleDateString("fr-CA")}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}



