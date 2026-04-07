/**
 * AccessibilityTab — Onglet "Accessibilité"
 * Options d'accessibilité pour une meilleure expérience
 */

"use client";

import { Language, useAppState } from "@/core/state/app_state";

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

interface AccessibilityTabProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
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
    title: "Accessibilité",
    description: "Options d'accessibilité pour une meilleure expérience.",
    fontSize: "Taille de la police",
    fontSizeSmall: "Petite",
    fontSizeMedium: "Moyenne",
    fontSizeLarge: "Grande",
    highContrast: "Contraste élevé",
    highContrastDesc: "Augmente le contraste pour une meilleure lisibilité",
    reducedMotion: "Réduire les animations",
    reducedMotionDesc: "Désactive les animations et transitions",
    screenReader: "Optimisé pour lecteur d'écran",
    screenReaderDesc: "Améliore la compatibilité avec les lecteurs d'écran",
  },
  en: {
    title: "Accessibility",
    description: "Accessibility options for a better experience.",
    fontSize: "Font size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    highContrast: "High contrast",
    highContrastDesc: "Increases contrast for better readability",
    reducedMotion: "Reduce motion",
    reducedMotionDesc: "Disables animations and transitions",
    screenReader: "Screen reader optimized",
    screenReaderDesc: "Improves compatibility with screen readers",
  },
};

export function AccessibilityTab({ settings, onChange }: AccessibilityTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const fontSizes = [
    { value: "small" as const, label: t.fontSizeSmall },
    { value: "medium" as const, label: t.fontSizeMedium },
    { value: "large" as const, label: t.fontSizeLarge },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{t.description}</p>

      {/* Taille de la police */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">{t.fontSize}</label>
        <div className="flex gap-2">
          {fontSizes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...settings, fontSize: value })}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                settings.fontSize === value
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Toggle
          value={settings.highContrast}
          onChange={(v) => onChange({ ...settings, highContrast: v })}
          label={t.highContrast}
          description={t.highContrastDesc}
        />
        <Toggle
          value={settings.reducedMotion}
          onChange={(v) => onChange({ ...settings, reducedMotion: v })}
          label={t.reducedMotion}
          description={t.reducedMotionDesc}
        />
        <Toggle
          value={settings.screenReaderOptimized}
          onChange={(v) => onChange({ ...settings, screenReaderOptimized: v })}
          label={t.screenReader}
          description={t.screenReaderDesc}
        />
      </div>
    </div>
  );
}
