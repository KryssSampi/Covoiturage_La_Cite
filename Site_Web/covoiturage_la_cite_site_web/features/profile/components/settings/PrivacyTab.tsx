/**
 * PrivacyTab — Onglet "Confidentialité"
 * Paramètres de confidentialité : téléphone, nom, affinité
 */

"use client";

import { Language, useAppState } from "@/core/state/app_state";

interface PrivacySettings {
  showPhoneNumber: boolean;
  showLastName: boolean;
  allowAffinityTracking: boolean;
}

interface PrivacyTabProps {
  privacy: PrivacySettings;
  onChange: (privacy: PrivacySettings) => void;
}

function Toggle({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const translations = {
  fr: {
    title: "Confidentialité",
    description: "Contrôlez qui peut voir vos informations personnelles.",
    showPhone: "Afficher mon numéro de téléphone",
    showPhoneDesc: "Les autres utilisateurs pourront voir votre numéro",
    showLastName: "Afficher mon nom de famille",
    showLastNameDesc: "Affiche votre nom complet sur votre profil public",
    allowAffinity: "Suivi d'affinité",
    allowAffinityDesc: "Autoriser l'analyse de vos préférences pour améliorer les suggestions",
  },
  en: {
    title: "Privacy",
    description: "Control who can see your personal information.",
    showPhone: "Show my phone number",
    showPhoneDesc: "Other users will be able to see your number",
    showLastName: "Show my last name",
    showLastNameDesc: "Display your full name on your public profile",
    allowAffinity: "Affinity tracking",
    allowAffinityDesc: "Allow analysis of your preferences to improve suggestions",
  },
};

export function PrivacyTab({ privacy, onChange }: PrivacyTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{t.description}</p>

      <div className="space-y-3">
        <Toggle
          value={privacy.showPhoneNumber}
          onChange={(v) => onChange({ ...privacy, showPhoneNumber: v })}
          label={t.showPhone}
          description={t.showPhoneDesc}
        />
        <Toggle
          value={privacy.showLastName}
          onChange={(v) => onChange({ ...privacy, showLastName: v })}
          label={t.showLastName}
          description={t.showLastNameDesc}
        />
        <Toggle
          value={privacy.allowAffinityTracking}
          onChange={(v) => onChange({ ...privacy, allowAffinityTracking: v })}
          label={t.allowAffinity}
          description={t.allowAffinityDesc}
        />
      </div>
    </div>
  );
}
