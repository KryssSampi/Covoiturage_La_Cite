/**
 * TripAmbianceTab — Onglet "Ambiance Trajet"
 * Préférences de comportement en trajet : musique, animaux, fumée, conversation
 */

"use client";

import { FaCommentDots, FaMusic, FaDog, FaSmoking } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import type { ConversationLevelPref } from "../../types/profile.types";

interface TripAmbianceState {
  musicAccepted: boolean;
  petsAccepted: boolean;
  smokingAccepted: boolean;
  conversationLevel: ConversationLevelPref;
}

interface TripAmbianceTabProps {
  preferences: TripAmbianceState;
  onChange: (prefs: TripAmbianceState) => void;
}

const ICON_COLOR = "#08316e";

function AmbianceToggle({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onChange(!value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onChange(!value);
        }
      }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
        value ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className={`text-2xl ${value ? "text-blue-600" : "text-gray-400"}`}>{icon}</div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <div className="rounded-full bg-white p-1 shadow-sm">
        <div className={`h-3 w-3 rounded-full transition-opacity ${value ? "bg-blue-500 opacity-100" : "opacity-0"}`} />
      </div>
    </div>
  );
}

const translations = {
  fr: {
    title: "Ambiance de Trajet",
    description: "Indiquez vos préférences pour une meilleure expérience collective.",
    talk: "Parler",
    music: "Musique",
    pets: "Animaux",
    smoke: "Fumer",
  },
  en: {
    title: "Trip Ambiance",
    description: "Indicate your preferences for a better collective experience.",
    talk: "Talk",
    music: "Music",
    pets: "Pets",
    smoke: "Smoke",
  },
};

export function TripAmbianceTab({ preferences, onChange }: TripAmbianceTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold">{t.title}</h2>
      <p className="mb-4 text-xs text-gray-500">{t.description}</p>

      <div className="grid grid-cols-4 gap-3">
        <AmbianceToggle
          icon={<FaCommentDots style={{ color: ICON_COLOR }} />}
          label={t.talk}
          value={preferences.conversationLevel !== "quiet"}
          onChange={(v) =>
            onChange({
              ...preferences,
              conversationLevel: v ? "moderate" : "quiet",
            })
          }
        />
        <AmbianceToggle
          icon={<FaMusic style={{ color: ICON_COLOR }} />}
          label={t.music}
          value={preferences.musicAccepted}
          onChange={(v) => onChange({ ...preferences, musicAccepted: v })}
        />
        <AmbianceToggle
          icon={<FaDog style={{ color: ICON_COLOR }} />}
          label={t.pets}
          value={preferences.petsAccepted}
          onChange={(v) => onChange({ ...preferences, petsAccepted: v })}
        />
        <AmbianceToggle
          icon={<FaSmoking style={{ color: ICON_COLOR }} />}
          label={t.smoke}
          value={preferences.smokingAccepted}
          onChange={(v) => onChange({ ...preferences, smokingAccepted: v })}
        />
      </div>
    </div>
  );
}
