"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getPlatformSettingsAction,
  updatePlatformSettingsAction,
  toggleMaintenanceModeAction,
} from "@/features/admin/services/admin.actions";
import {
  AdminPageHeader,
  AdminTabs,
  ActionButton,
  ErrorDisplay,
  LoadingSpinner,
  EmptyState,
} from "@/features/admin/components/AdminShared";

const TABS = ["General", "Securite", "CORS & API", "Notifications"] as const;
type Tab = typeof TABS[number];

interface PlatformSettings {
  id: string;
  smtpHost: string;
  smtpPort: number;
  corsOrigins: string[];
  jwtExpiration: number;
  maxLoginAttempts: number;
  rateLimitPerMinute: number;
  platformName: string;
  maintenanceMode: boolean;
}

type UpdateSettingsPayload = Partial<Omit<PlatformSettings, "id">>;

function toUpdatePayload(settings: PlatformSettings): UpdateSettingsPayload {
  return {
    smtpHost: settings.smtpHost,
    smtpPort: settings.smtpPort,
    corsOrigins: settings.corsOrigins,
    jwtExpiration: settings.jwtExpiration,
    maxLoginAttempts: settings.maxLoginAttempts,
    rateLimitPerMinute: settings.rateLimitPerMinute,
    platformName: settings.platformName,
    maintenanceMode: settings.maintenanceMode,
  };
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className={`text-sm font-medium ${danger ? "text-red-700" : "text-slate-700"}`}>{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? (danger ? "bg-red-500" : "bg-indigo-600") : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function Field({
  label,
  description,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  description?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {description && <p className="text-xs text-slate-400">{description}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab]           = useState<Tab>("General");
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [draft, setDraft]       = useState<PlatformSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlatformSettingsAction();
      setSettings(data as PlatformSettings);
      setDraft(data as PlatformSettings);
    } catch (e) {
      setError((e as Error).message ?? "Impossible de charger les parametres");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function patch<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) {
    setDraft((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updatePlatformSettingsAction(toUpdatePayload(draft));
      setSettings(draft);
      setFeedback("Parametres sauvegardes.");
    } catch (e) {
      setFeedback((e as Error).message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleMaintenance() {
    if (!draft) return;
    const next = !draft.maintenanceMode;
    const label = next ? "activer" : "desactiver";
    if (!window.confirm(`Voulez-vous ${label} le mode maintenance ?`)) return;
    setSaving(true);
    setFeedback(null);
    try {
      await toggleMaintenanceModeAction(next);
      patch("maintenanceMode", next);
      setFeedback(`Mode maintenance ${next ? "active" : "desactive"}.`);
    } catch (e) {
      setFeedback((e as Error).message ?? "Erreur lors de la mise a jour du mode maintenance.");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = JSON.stringify(settings) !== JSON.stringify(draft);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!draft) return <ErrorDisplay message={error ?? "Parametres introuvables"} onRetry={load} />;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Configuration plateforme"
        subtitle="Parametres globaux alignes avec le server core"
        action={
          <div className="flex gap-2">
            <ActionButton label="Refresh" onClick={load} disabled={loading} />
            <ActionButton
              label={saving ? "Sauvegarde..." : "Sauvegarder"}
              onClick={handleSave}
              variant="primary"
              disabled={!isDirty || saving}
            />
          </div>
        }
      />

      {feedback && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${
          feedback.includes("Erreur") ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
        }`}>
          {feedback}
        </div>
      )}

      {error && <ErrorDisplay message={error} onRetry={load} />}

      {draft.maintenanceMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Mode maintenance actif</p>
            <p className="text-xs text-amber-600">Seuls les administrateurs peuvent acceder a la plateforme.</p>
          </div>
          <ActionButton label="Desactiver" onClick={handleToggleMaintenance} variant="danger" disabled={saving} />
        </div>
      )}

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as Tab)} />

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        {tab === "General" && (
          <>
            <Field
              label="Nom de la plateforme"
              value={draft.platformName}
              onChange={(v) => patch("platformName", v)}
            />
            <Field
              label="Serveur SMTP"
              value={draft.smtpHost}
              onChange={(v) => patch("smtpHost", v)}
            />
            <Field
              label="Port SMTP"
              value={draft.smtpPort}
              onChange={(v) => patch("smtpPort", Number(v))}
              type="number"
            />
            <div className="border-t border-slate-100 pt-4">
              <Toggle
                label="Mode maintenance"
                description="Bloque l'acces a tous sauf les administrateurs."
                checked={draft.maintenanceMode}
                onChange={handleToggleMaintenance}
                danger
              />
            </div>
          </>
        )}

        {tab === "Securite" && (
          <>
            <Field
              label="Expiration JWT (secondes)"
              value={draft.jwtExpiration}
              onChange={(v) => patch("jwtExpiration", Number(v))}
              type="number"
            />
            <Field
              label="Tentatives de connexion max"
              description="Apres ce nombre d'echecs, le compte est temporairement bloque."
              value={draft.maxLoginAttempts}
              onChange={(v) => patch("maxLoginAttempts", Number(v))}
              type="number"
            />
            <Field
              label="Rate limit (requetes/minute)"
              value={draft.rateLimitPerMinute}
              onChange={(v) => patch("rateLimitPerMinute", Number(v))}
              type="number"
            />
          </>
        )}

        {tab === "CORS & API" && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Origines autorisees (CORS)</label>
            <p className="text-xs text-slate-400">Une URL par ligne.</p>
            <textarea
              rows={5}
              value={draft.corsOrigins.join("\n")}
              onChange={(e) =>
                patch("corsOrigins", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>
        )}

        {tab === "Notifications" && (
          <EmptyState text="Les reglages de notifications ne sont pas exposes par le server core admin pour le moment." />
        )}
      </div>

      {isDirty && (
        <div className="flex justify-end">
          <ActionButton
            label={saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            onClick={handleSave}
            variant="primary"
            disabled={saving}
          />
        </div>
      )}
    </div>
  );
}
