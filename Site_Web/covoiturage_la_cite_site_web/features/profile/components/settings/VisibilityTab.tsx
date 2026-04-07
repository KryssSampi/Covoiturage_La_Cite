/**
 * VisibilityTab — Onglet "Visibilité"
 * Contrôle de ce qui est affiché publiquement sur le profil
 */

"use client";

import { Language, useAppState } from "@/core/state/app_state";
import type { ProfileVisibility } from "../../types/profile.types";

interface VisibilityTabProps {
  visibility: ProfileVisibility;
  onChange: (visibility: ProfileVisibility) => void;
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
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
  );
}

const translations = {
  fr: {
    title: "Visibilité du Profil",
    description: "Contrôlez les informations visibles sur votre profil public.",
    goScore: "Go Score (Votre score global)",
    tripsCount: "Nombre de trajets (Expérience)",
    globalRating: "Note globale (Évaluations moyennes)",
    co2Saved: "Économie CO2 (Impact écologique)",
  },
  en: {
    title: "Profile Visibility",
    description: "Control the information visible on your public profile.",
    goScore: "Go Score (Your global score)",
    tripsCount: "Number of trips (Experience)",
    globalRating: "Global rating (Average evaluations)",
    co2Saved: "CO2 savings (Ecological impact)",
  },
};

export function VisibilityTab({ visibility, onChange }: VisibilityTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const items = [
    { key: "goScore" as const, label: t.goScore },
    { key: "tripsCount" as const, label: t.tripsCount },
    { key: "globalRating" as const, label: t.globalRating },
    { key: "co2Saved" as const, label: t.co2Saved },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{t.description}</p>

      <div className="space-y-3">
        {items.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{label}</span>
              <span className="text-gray-400">?</span>
            </div>
            <Toggle
              value={visibility[key]}
              onChange={(v) => onChange({ ...visibility, [key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
