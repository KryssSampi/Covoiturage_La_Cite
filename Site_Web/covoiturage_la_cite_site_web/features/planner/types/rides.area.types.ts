/**
 * @file rides.area.types.ts
 * @description Types et interfaces de la zone d'affichage des trajets (RideArea).
 */

import type { Language } from "@/core/state/app_state";
import type { Dispatch, SetStateAction } from "react";
import type { PublishedTripStatus } from "@/features/dashboard/types";

// ─── TRI ──────────────────────────────────────────────────────────────────────

/** Clé de tri disponible pour la liste des trajets du planificateur */
export type SortKey = "time-asc" | "time-desc" | "status";

// ─── LÉGENDE STATUTS ──────────────────────────────────────────────────────────

/** Entrée calculée dans la légende des statuts présents dans la journée */
export interface StatusCount {
  status: string;
  count:  number;
  hex:    string;
  label:  string;
}

// ─── PROPS SOUS-COMPOSANTS ────────────────────────────────────────────────────

/** Props du bandeau de navigation par jour */
export interface RidesAreaHeaderProps {
  isFr:       boolean;
  currentDay: Date;
  isToday:    boolean;
  lang:       Language;
  showAll:    boolean;
  onPrevDay:  () => void;
  onNextDay:  () => void;
  onToday:    () => void;
  onToggleShowAll: () => void;
}

/** Props de la légende de statuts cliquable */
export interface RidesStatusLegendProps {
  isFr:           boolean;
  statusCounts:   StatusCount[];
  filterStatus:   string;
  onFilterChange: (status: string) => void;
}

/** Props de la barre d'outils (recherche, filtre statut, tri, compteur) */
export interface RidesToolbarProps {
  isFr:            boolean;
  lang:            Language;
  searchQuery:     string;
  filterStatus:    string;
  sortBy:          SortKey;
  statusKeys:      string[];
  statusLabels:    Record<string, Record<Language, string>>;
  visibleCount:    number;
  totalCount:      number;
  hasActiveFilter: boolean;
  onSearchChange:  (q: string) => void;
  onFilterChange:  (s: string) => void;
  onSortChange:    (s: SortKey) => void;
}

/** Props de l'état vide (aucun trajet trouvé) */
export interface RidesEmptyStateProps {
  isFr:       boolean;
  isFiltered: boolean;
  onReset:    () => void;
}

/** Props de la liste de cartes de trajets */
export interface RidesListProps {
  isDriver:                boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visibleRides:            any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isPassengerListOpens:    any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setIsPassengerListOpens: (v: any) => void;
  formatStatus:            (status: PublishedTripStatus, lang: Language) => string;
  getStatusColor:          (status: PublishedTripStatus) => string;
  openPassengerLists:      boolean[];
  setOpenPassengerLists:   Dispatch<SetStateAction<boolean[]>>;
}
