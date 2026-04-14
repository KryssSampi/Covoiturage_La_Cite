/**
 * SearchPreferencesTab — Onglet "Recherche"
 * Préférences de recherche de trajet : rayons, tolérance, prix max, exigences
 */

"use client";

import { FaPencil } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import type { BaggageLevel } from "../../types/profile.types";

interface SearchPreferences {
  defaultDepartureRadiusMeters: number;
  defaultArrivalRadiusMeters: number;
  defaultTimeToleranceMinutes: number;
  defaultMaxPrice?: number;
  requireVerifiedDriver: boolean;
  minDriverGoScore: number;
  minDriverRating: number;
  minPassengerGoScore: number;
  baggagePolicy: BaggageLevel;
  requirePassengerMessage: boolean;
}

interface SearchPreferencesTabProps {
  preferences: SearchPreferences;
  onChange: (prefs: SearchPreferences) => void;
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
    title: "Préférences de Recherche",
    description: "Configurez vos critères de recherche pour trouver les trajets qui vous correspondent.",
    searchRadius: "Rayon de recherche",
    departureRadius: "Rayon de départ (mètres)",
    arrivalRadius: "Rayon d'arrivée (mètres)",
    timeTolerance: "Tolérance horaire (±minutes)",
    maxPrice: "Prix maximum par trajet (€)",
    securityRequirements: "Exigences de sécurité",
    requireVerifiedDriver: "Exiger un conducteur vérifié",
    minDriverGoScore: "GoScore minimum du conducteur",
    minDriverRating: "Note minimum du conducteur",
    driverRequirements: "Exigences du conducteur",
    minPassengerGoScore: "GoScore minimum des passagers",
    baggagePolicy: "Politique de bagages",
    requirePassengerMessage: "Exiger un message du passager",
    baggageNone: "Aucun bagage",
    baggageLight: "Bagage léger",
    baggageHeavy: "Bagage encombrant",
  },
  en: {
    title: "Search Preferences",
    description: "Configure your search criteria to find trips that match your needs.",
    searchRadius: "Search radius",
    departureRadius: "Departure radius (meters)",
    arrivalRadius: "Arrival radius (meters)",
    timeTolerance: "Time tolerance (±minutes)",
    maxPrice: "Maximum price per trip (€)",
    securityRequirements: "Security requirements",
    requireVerifiedDriver: "Require verified driver",
    minDriverGoScore: "Minimum driver GoScore",
    minDriverRating: "Minimum driver rating",
    driverRequirements: "Driver requirements",
    minPassengerGoScore: "Minimum passenger GoScore",
    baggagePolicy: "Baggage policy",
    requirePassengerMessage: "Require passenger message",
    baggageNone: "No baggage",
    baggageLight: "Light baggage",
    baggageHeavy: "Heavy baggage",
  },
};

export function SearchPreferencesTab({ preferences, onChange }: SearchPreferencesTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const baggageLabels: Record<BaggageLevel, string> = {
    none: isFR ? translations.fr.baggageNone : translations.en.baggageNone,
    light: isFR ? translations.fr.baggageLight : translations.en.baggageLight,
    heavy: isFR ? translations.fr.baggageHeavy : translations.en.baggageHeavy,
  };

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{t.description}</p>

      {/* Rayon de recherche */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t.searchRadius}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">{t.departureRadius}</label>
            <div className="relative">
              <input
                type="number"
                value={preferences.defaultDepartureRadiusMeters}
                onChange={(e) =>
                  onChange({ ...preferences, defaultDepartureRadiusMeters: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">{t.arrivalRadius}</label>
            <div className="relative">
              <input
                type="number"
                value={preferences.defaultArrivalRadiusMeters}
                onChange={(e) =>
                  onChange({ ...preferences, defaultArrivalRadiusMeters: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm text-gray-600">{t.timeTolerance}</label>
          <div className="relative">
            <input
              type="number"
              value={preferences.defaultTimeToleranceMinutes}
              onChange={(e) =>
                onChange({ ...preferences, defaultTimeToleranceMinutes: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm text-gray-600">{t.maxPrice}</label>
          <div className="relative">
            <input
              type="number"
              value={preferences.defaultMaxPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  defaultMaxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder={isFR ? "Illimité" : "Unlimited"}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Exigences de sécurité */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t.securityRequirements}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t.requireVerifiedDriver}</span>
            <Toggle
              value={preferences.requireVerifiedDriver}
              onChange={(v) => onChange({ ...preferences, requireVerifiedDriver: v })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">{t.minDriverGoScore}</label>
            <input
              type="number"
              value={preferences.minDriverGoScore}
              onChange={(e) =>
                onChange({ ...preferences, minDriverGoScore: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">{t.minDriverRating}</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={preferences.minDriverRating}
              onChange={(e) =>
                onChange({ ...preferences, minDriverRating: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Exigences du conducteur */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t.driverRequirements}</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">{t.minPassengerGoScore}</label>
            <input
              type="number"
              value={preferences.minPassengerGoScore}
              onChange={(e) =>
                onChange({ ...preferences, minPassengerGoScore: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">{t.baggagePolicy}</label>
            <div className="relative">
              <select
                value={preferences.baggagePolicy}
                onChange={(e) =>
                  onChange({
                    ...preferences,
                    baggagePolicy: e.target.value as BaggageLevel,
                  })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none appearance-none"
              >
                <option value="none">{baggageLabels.none}</option>
                <option value="light">{baggageLabels.light}</option>
                <option value="heavy">{baggageLabels.heavy}</option>
              </select>
              <span className="absolute right-3 top-3 text-gray-400">▼</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t.requirePassengerMessage}</span>
            <Toggle
              value={preferences.requirePassengerMessage}
              onChange={(v) => onChange({ ...preferences, requirePassengerMessage: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
