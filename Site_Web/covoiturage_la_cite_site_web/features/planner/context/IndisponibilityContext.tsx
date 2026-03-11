"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Indisponibility } from "@/features/planner/types/calendar.types";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

/** Correspondance index → nom du jour en anglais */
const WEEKDAYS_EN: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

/** Valeur de jour par défaut du formulaire */
const DEFAULT_WEEKDAY = "monday";

// ─── INTERFACE DU CONTEXTE ────────────────────────────────────────────────────

export interface IndisponibilityContextType {
  /** Indique si le panneau de gestion d'indisponibilité est ouvert */
  disponibilitySetterIsActive: boolean;
  /** Ouvre ou ferme le panneau d'indisponibilité */
  setDisponibilitySetterIsActive: (v: boolean) => void;
  /** Liste des indisponibilités récurrentes */
  indisponibilities: Indisponibility[];
  /**
   * Ajoute une indisponibilité à la liste (sans doublon).
   * @param weekday - Jour de la semaine (ex: "monday")
   * @param start   - Heure de début "HH:mm"
   * @param end     - Heure de fin "HH:mm"
   */
  addIndisponibility: (weekday: string, start: string, end: string) => void;
  /**
   * Supprime l'indisponibilité à l'index donné.
   * @param index - Position dans le tableau
   */
  removeIndisponibility: (index: number) => void;
  /**
   * Marque un créneau calendrier (jour + heure) comme indisponible.
   * Calcule automatiquement le weekday et la plage +30 min.
   */
  markSlotUnavailable: (day: Date, hour: number, minute: number) => void;
  /**
   * Indique si un créneau calendrier est actuellement marqué indisponible.
   */
  isSlotUnavailable: (day: Date, hour: number, minute: number) => boolean;
  /**
   * Bascule l'indisponibilité d'un créneau (ajoute si absent, retire sinon).
   */
  toggleSlotUnavailability: (day: Date, hour: number, minute: number) => void;
  /** Valeur du formulaire — jour de la semaine */
  formWeekday: string;
  setFormWeekday: (v: string) => void;
  /** Valeur du formulaire — heure de début */
  formStart: string;
  setFormStart: (v: string) => void;
  /** Valeur du formulaire — heure de fin */
  formEnd: string;
  setFormEnd: (v: string) => void;
  /** Soumet le formulaire : ajoute l'indisponibilité depuis les champs du formulaire */
  submitForm: () => void;
  /** Réinitialise les champs du formulaire aux valeurs par défaut */
  resetForm: () => void;
}

// ─── CONTEXTE ─────────────────────────────────────────────────────────────────

const IndisponibilityContext = createContext<IndisponibilityContextType | undefined>(
  undefined
);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

/**
 * Fournisseur du contexte d'indisponibilité.
 * Enveloppe les pages du planificateur pour exposer l'état à tous les composants enfants.
 */
export function IndisponibilityProvider({ children }: { children: ReactNode }) {
  // État d'ouverture du panneau
  const [disponibilitySetterIsActive, setDisponibilitySetterIsActive] = useState(false);

  // Liste des indisponibilités récurrentes
  const [indisponibilities, setIndisponibilities] = useState<Indisponibility[]>([]);

  // État du formulaire d'ajout manuel
  const [formWeekday, setFormWeekday] = useState(DEFAULT_WEEKDAY);
  const [formStart,   setFormStart]   = useState("08:00");
  const [formEnd,     setFormEnd]     = useState("09:00");

  /** Ajoute une indisponibilité sans doublon */
  const addIndisponibility = useCallback(
    (weekday: string, start: string, end: string) => {
      setIndisponibilities((prev) => {
        // Évite les doublons exacts
        const exists = prev.some(
          (i) =>
            i.weekday.toLowerCase() === weekday.toLowerCase() &&
            i.start === start &&
            i.end   === end
        );
        if (exists) return prev;
        return [...prev, { weekday, start, end }];
      });
    },
    []
  );

  /** Supprime une indisponibilité par son index */
  const removeIndisponibility = useCallback((index: number) => {
    setIndisponibilities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Marque un créneau du calendrier (jour + heure) comme indisponible.
   * La plage couvre 30 minutes à partir du moment cliqué.
   */
  const markSlotUnavailable = useCallback(
    (day: Date, hour: number, minute: number) => {
      const weekday = WEEKDAYS_EN[day.getDay()];
      const start   = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      // Calcul de la fin : +30 min avec gestion du débordement d'heure
      const endMin    = minute + 30;
      const endHour   = hour + Math.floor(endMin / 60);
      const endMinute = endMin % 60;
      const end       = `${String(Math.min(endHour, 23)).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

      addIndisponibility(weekday, start, end);
    },
    [addIndisponibility]
  );

  /**
   * Vérifie si un créneau calendrier chevauche une indisponibilité existante.
   */
  const isSlotUnavailable = useCallback(
    (day: Date, hour: number, minute: number): boolean => {
      const weekday = WEEKDAYS_EN[day.getDay()];
      const time    = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      return indisponibilities.some(
        (i) =>
          i.weekday.toLowerCase() === weekday.toLowerCase() &&
          i.start <= time &&
          i.end   >  time
      );
    },
    [indisponibilities]
  );

  /**
   * Bascule l'indisponibilité d'un créneau donné :
   * - Si le créneau est déjà marqué → supprime la(les) entrée(s) correspondante(s)
   * - Sinon → l'ajoute (+30 min)
   */
  const toggleSlotUnavailability = useCallback(
    (day: Date, hour: number, minute: number) => {
      const weekday = WEEKDAYS_EN[day.getDay()];
      const time    = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      const matchesSlot = (i: Indisponibility) =>
        i.weekday.toLowerCase() === weekday.toLowerCase() &&
        i.start <= time &&
        i.end   >  time;

      setIndisponibilities((prev) => {
        const hasMatch = prev.some(matchesSlot);
        if (hasMatch) {
          // Retire les entrées qui couvrent ce créneau
          return prev.filter((i) => !matchesSlot(i));
        }
        // Ajoute une nouvelle entrée de 30 min
        const endMin    = minute + 30;
        const endHour   = hour + Math.floor(endMin / 60);
        const endMinute = endMin % 60;
        const end = `${String(Math.min(endHour, 23)).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
        return [...prev, { weekday, start: time, end }];
      });
    },
    []
  );

  /** Soumet le formulaire et remet les champs à leurs valeurs par défaut */
  const submitForm = useCallback(() => {
    if (!formStart || !formEnd) return;
    if (formStart >= formEnd) return; // Validation : début < fin
    addIndisponibility(formWeekday, formStart, formEnd);
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formWeekday, formStart, formEnd, addIndisponibility]);

  /** Réinitialise les champs du formulaire */
  const resetForm = useCallback(() => {
    setFormWeekday(DEFAULT_WEEKDAY);
    setFormStart("08:00");
    setFormEnd("09:00");
  }, []);

  return (
    <IndisponibilityContext.Provider
      value={{
        disponibilitySetterIsActive,
        setDisponibilitySetterIsActive,
        indisponibilities,
        addIndisponibility,
        removeIndisponibility,
        markSlotUnavailable,
        isSlotUnavailable,
        toggleSlotUnavailability,
        formWeekday, setFormWeekday,
        formStart,   setFormStart,
        formEnd,     setFormEnd,
        submitForm,
        resetForm,
      }}
    >
      {children}
    </IndisponibilityContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Consomme le contexte d'indisponibilité.
 * Doit être utilisé à l'intérieur d'un IndisponibilityProvider.
 */
export function useIndisponibility(): IndisponibilityContextType {
  const ctx = useContext(IndisponibilityContext);
  if (!ctx)
    throw new Error(
      "useIndisponibility doit être utilisé à l'intérieur d'un IndisponibilityProvider"
    );
  return ctx;
}
