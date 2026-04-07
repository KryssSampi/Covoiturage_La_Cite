/**
 * NotificationsTab — Onglet "Notifications"
 * Préférences de notification : Email et Push par catégorie
 */

"use client";

import { Language, useAppState } from "@/core/state/app_state";

interface NotificationPreferences {
  emailPrimordiales: boolean;
  emailSecondaires: boolean;
  emailNegligeables: boolean;
  pushPrimordiales: boolean;
  pushSecondaires: boolean;
  pushNegligeables: boolean;
}

interface NotificationsTabProps {
  preferences: NotificationPreferences;
  onChange: (prefs: NotificationPreferences) => void;
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
    title: "Notifications",
    description: "Configurez vos préférences de notification.",
    emailSection: "Notifications par Email",
    pushSection: "Notifications Push",
    primordiales: "Réservations et annulations",
    secondaires: "Rappels et correspondances",
    negligeables: "Conseils et promotions",
  },
  en: {
    title: "Notifications",
    description: "Configure your notification preferences.",
    emailSection: "Email Notifications",
    pushSection: "Push Notifications",
    primordiales: "Reservations and cancellations",
    secondaires: "Reminders and matches",
    negligeables: "Tips and promotions",
  },
};

export function NotificationsTab({ preferences, onChange }: NotificationsTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const emailItems = [
    { key: "emailPrimordiales" as const, label: t.primordiales },
    { key: "emailSecondaires" as const, label: t.secondaires },
    { key: "emailNegligeables" as const, label: t.negligeables },
  ];

  const pushItems = [
    { key: "pushPrimordiales" as const, label: t.primordiales },
    { key: "pushSecondaires" as const, label: t.secondaires },
    { key: "pushNegligeables" as const, label: t.negligeables },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{t.description}</p>

      {/* Email Notifications */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t.emailSection}</h3>
        <div className="space-y-3">
          {emailItems.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
              <span className="text-sm text-gray-700">{label}</span>
              <Toggle
                value={preferences[key]}
                onChange={(v) => onChange({ ...preferences, [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t.pushSection}</h3>
        <div className="space-y-3">
          {pushItems.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
              <span className="text-sm text-gray-700">{label}</span>
              <Toggle
                value={preferences[key]}
                onChange={(v) => onChange({ ...preferences, [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
