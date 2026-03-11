"use client";

import { useState, useRef, useCallback } from "react";
import { TRANSITION_MS } from "@/features/planner/constants/calendar.constants";

// ─── TYPES ────────────────────────────────────────────────────────────────────

/** Résultat retourné par le hook useCalendarWindow */
export interface CalendarWindowState {
  /** Décalage courant par rapport au pivot (0 = aujourd'hui/semaine actuelle) */
  offset:   number;
  /** Fenêtre glissante de 4 offsets pour le carrousel d'animation */
  window4:  number[];
  /** Direction de l'animation en cours ("next", "prev", ou null) */
  animDir:  string | null;
  /** Navigue d'un pas dans la direction donnée avec animation */
  navigate: (dir: string) => void;
  /** Saute directement à un offset cible sans animation */
  jumpTo:   (targetOffset: number) => void;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Gère l'état de navigation d'un calendrier (mois ou semaine).
 *
 * - `navigate(dir)` : déclenche la transition animée vers "next" ou "prev".
 * - `jumpTo(offset)` : téléporte directement à un offset (ex. depuis le sélecteur mois/année).
 * - `window4` : tableau de 4 offsets utilisé pour pré-rendre les grilles adjacentes.
 */
/**
 * Gère l'état de navigation d'un calendrier (mois ou semaine).
 * Le paramètre `unit` est gardé pour de futures évolutions (différencier les comportements).
 *
 * - `navigate(dir)` : déclenche la transition animée vers "next" ou "prev".
 * - `jumpTo(offset)` : téléporte directement à un offset (ex. depuis le sélecteur mois/année).
 * - `window4` : tableau de 4 offsets utilisé pour pré-rendre les grilles adjacentes.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useCalendarWindow(unit: string = "month"): CalendarWindowState {
  // Décalage courant par rapport au pivot (0 = aujourd'hui)
  const [offset, setOffset]   = useState(0);

  // Fenêtre de 4 unités autour du pivot courant (pour le carrousel)
  const [window4, setWindow4] = useState([-1, 0, 1, 2]);

  // Direction de la transition en cours
  const [animDir, setAnimDir] = useState<string | null>(null);

  // Verrou pour éviter les animations concurrentes
  const animating = useRef(false);

  /** Navigue d'un pas avec animation dans la direction indiquée */
  const navigate = useCallback((dir: string) => {
    if (animating.current) return;
    animating.current = true;
    setAnimDir(dir);

    setTimeout(() => {
      if (dir === "next") {
        setOffset((o) => o + 1);
        setWindow4((w) => [...w.slice(1), w[w.length - 1] + 1]);
      } else {
        setOffset((o) => o - 1);
        setWindow4((w) => [w[0] - 1, ...w.slice(0, -1)]);
      }
      setAnimDir(null);
      animating.current = false;
    }, TRANSITION_MS);
  }, []);

  /** Saute directement à un offset sans animation (ex : sélecteur mois/année) */
  const jumpTo = useCallback((targetOffset: number) => {
    setOffset(targetOffset);
    setWindow4([targetOffset - 1, targetOffset, targetOffset + 1, targetOffset + 2]);
    setAnimDir(null);
  }, []);

  return { offset, window4, animDir, navigate, jumpTo };
}
