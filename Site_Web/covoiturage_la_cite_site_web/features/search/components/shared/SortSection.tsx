"use client";

/**
 * @file SortSection.tsx
 * @description Barre de tri compacte — options différentes selon le rôle.
 *
 * Passager  : prix /croissant/décroissant, départ, places
 * Conducteur: recommandé, distance, durée
 */

import {
  SearchRole,
  SortKey,
  PassengerSortKey,
  DriverSortKey,
  getPASSENGER_SORT_OPTIONS,
  getDRIVER_SORT_OPTIONS,
} from "@/features/search/types/search.feature.types";
import { Language, useAppState } from '@/core/state/app_state';

interface SortSectionProps {
  role:          SearchRole;
  activeSortKey: SortKey;
  onSortChange:  (key: SortKey) => void;
}

/**
 * SortSection — sélecteur de tri en chips horizontaux.
 */
export function SortSection({ role, activeSortKey, onSortChange }: SortSectionProps) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const options =
    role === "passenger"
      ? getPASSENGER_SORT_OPTIONS(isFR)
      : getDRIVER_SORT_OPTIONS(isFR);

  return (
    <div style={{
      display:    "flex",
      alignItems: "center",
      gap:         8,
      flexWrap:   "wrap",
      padding:    "4px 0",
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#5a6a85", whiteSpace: "nowrap" }}>
        {isFR ? 'Trier :' : 'Sort:'}
      </span>

      {options.map((opt) => {
        const isActive = opt.key === activeSortKey;
        return (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key as SortKey)}
            style={{
              background:   isActive ? "#08316e" : "#f0f4fb",
              color:        isActive ? "#fff"    : "#1a2a45",
              border:       "none",
              borderRadius: 20,
              padding:      "5px 13px",
              fontSize:     12,
              fontWeight:   isActive ? 700 : 500,
              cursor:       "pointer",
              transition:   "all 0.18s",
              whiteSpace:   "nowrap",
            }}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export type { PassengerSortKey, DriverSortKey };
