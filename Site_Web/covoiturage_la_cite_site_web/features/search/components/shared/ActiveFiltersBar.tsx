"use client";

/**
 * @file ActiveFiltersBar.tsx
 * @description Bande de chips representant les filtres actifs (non-defauts).
 *
 * Chaque chip affiche le label du filtre et sa valeur.
 * Le bouton x reinitialise ce filtre a sa valeur par defaut en un clic.
 *
 * N affiche rien si aucun filtre n est actif (hors valeurs par defaut).
 */

import { FaXmark } from "react-icons/fa6";
import {
  SearchFilters,
  DEFAULT_SEARCH_FILTERS,
} from "@/features/search/types/search.feature.types";

// Mapping clé → label lisible en français
const FILTER_LABELS: Partial<Record<keyof SearchFilters, string>> = {
  departureRadiusMeters: "Rayon départ",
  arrivalRadiusMeters:   "Rayon arrivée",
  maxPrice:              "Prix max",
  minSeatsAvailable:     "Places min",
  driverName:            "Conducteur",
  maxDurationMinutes:    "Durée max",
  maxDistanceKm:         "Distance max",
};

// Formattage de la valeur selon la clé
function formatValue(key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]): string {
  if (value === undefined || value === null) return "";
  switch (key) {
    case "departureRadiusMeters":
    case "arrivalRadiusMeters":
      return `${value} m`;
    case "maxPrice":
      return `${value} $`;
    case "minSeatsAvailable":
      return `${value} place${Number(value) > 1 ? "s" : ""}`;
    case "maxDurationMinutes":
      return `${value} min`;
    case "maxDistanceKm":
      return `${value} km`;
    default:
      return String(value);
  }
}

// Vérifie si un filtre diffère de sa valeur par défaut
function isDifferentFromDefault(
  key: keyof SearchFilters,
  value: SearchFilters[keyof SearchFilters]
): boolean {
  const defaultValue = DEFAULT_SEARCH_FILTERS[key];

  // Cas spécial : driverName absent par défaut
  if (key === "driverName") {
    return typeof value === "string" && value.trim().length > 0;
  }

  // Cas spécial : statuses (tableau)
  if (key === "statuses") {
    if (!value && !defaultValue) return false;
    if (!value || !defaultValue) return true;
    return JSON.stringify(value) !== JSON.stringify(defaultValue);
  }

  return value !== defaultValue && value !== undefined;
}

export interface ActiveFiltersBarProps {
  /** État actuel des filtres */
  filters:        SearchFilters;
  /** Callback pour réinitialiser un filtre précis */
  onRemoveFilter: (key: keyof SearchFilters) => void;
}

/**
 * ActiveFiltersBar — affiche les filtres actifs sous forme de chips supprimables.
 * Si aucun filtre n'est actif, le composant ne rend rien.
 */
export function ActiveFiltersBar({ filters, onRemoveFilter }: ActiveFiltersBarProps) {
  // Collecte les clés des filtres actifs (différents des valeurs par défaut)
  const activeKeys = (Object.keys(filters) as (keyof SearchFilters)[]).filter((key) => {
    if (!(key in FILTER_LABELS)) return false; // Ignorer les clés sans label
    return isDifferentFromDefault(key, filters[key]);
  });

  // Rien à afficher si aucun filtre actif
  if (activeKeys.length === 0) return null;

  return (
    <div style={{
      display:   "flex",
      flexWrap:  "wrap",
      gap:       8,
      padding:   "8px 4px",
      alignItems: "center",
    }}>
      {/* Label "Filtres actifs :" */}
      <span style={{ fontSize: 12, color: "#5a6a85", fontWeight: 600, flexShrink: 0 }}>
        Filtres actifs :
      </span>

      {/* Chips */}
      {activeKeys.map((key) => (
        <span
          key={key}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          5,
            background:   "#e8eef8",
            border:       "1.5px solid #c0cde8",
            borderRadius: 20,
            padding:      "3px 10px 3px 11px",
            fontSize:     12,
            fontWeight:   600,
            color:        "#08316e",
          }}
        >
          {FILTER_LABELS[key]} : {formatValue(key, filters[key])}
          <button
            onClick={() => onRemoveFilter(key)}
            aria-label={`Supprimer le filtre ${FILTER_LABELS[key]}`}
            style={{
              display:    "flex",
              alignItems: "center",
              background: "transparent",
              border:     "none",
              cursor:     "pointer",
              padding:    "0 0 0 2px",
              color:      "#08316e",
              opacity:    0.7,
            }}
          >
            <FaXmark size={11} />
          </button>
        </span>
      ))}

      {/* Bouton tout effacer (si plus d'un filtre actif) */}
      {activeKeys.length > 1 && (
        <button
          onClick={() => activeKeys.forEach((k) => onRemoveFilter(k))}
          style={{
            fontSize:     11,
            color:        "#e04a2f",
            background:   "transparent",
            border:       "none",
            cursor:       "pointer",
            fontWeight:   600,
            padding:      "2px 6px",
            borderRadius: 8,
          }}
        >
          Tout effacer
        </button>
      )}
    </div>
  );
}
