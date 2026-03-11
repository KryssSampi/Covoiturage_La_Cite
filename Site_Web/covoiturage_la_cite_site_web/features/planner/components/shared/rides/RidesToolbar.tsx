"use client";

/**
 * @file RidesToolbar.tsx
 * @description Barre d'outils de la zone trajets :
 * champ de recherche, filtre par statut, sélecteur de tri et compteur de résultats.
 */

import { FaSearch }          from "react-icons/fa";
import { MdFilterList, MdSort } from "react-icons/md";

import type { RidesToolbarProps } from "@/features/planner/types/rides.area.types";

/**
 * Affiche les contrôles de filtrage et de tri de la liste des trajets.
 *
 * - Champ de texte pour chercher par départ ou destination
 * - `<select>` pour filtrer par statut
 * - `<select>` pour choisir le tri
 * - Compteur de résultats visibles / total
 */
export function RidesToolbar({
  isFr,
  lang,
  searchQuery,
  filterStatus,
  sortBy,
  statusKeys,
  statusLabels,
  visibleCount,
  totalCount,
  hasActiveFilter,
  onSearchChange,
  onFilterChange,
  onSortChange,
}: RidesToolbarProps) {
  return (
    <div className="shrink-0 w-full bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3">

      {/* ── Champ de recherche ────────────────────────────────────────── */}
      <div className="flex-1 min-w-48 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={
            isFr
              ? "Rechercher un départ ou une destination…"
              : "Search departure or destination…"
          }
          className="w-full pl-9 pr-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-[#08316e]/25 focus:border-[#08316e]
                     placeholder:text-gray-300 transition"
        />
      </div>

      {/* ── Filtre par statut ─────────────────────────────────────────── */}
      <div className="relative flex items-center">
        <MdFilterList className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
          value={filterStatus}
          onChange={e => onFilterChange(e.target.value)}
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-[#08316e]/25 focus:border-[#08316e]
                     bg-white text-gray-700 cursor-pointer transition"
        >
          <option value="all">
            {isFr ? "Tous les statuts" : "All statuses"}
          </option>
          {statusKeys.map(s => (
            <option key={s} value={s}>
              {statusLabels[s]?.[lang] ?? s}
            </option>
          ))}
        </select>
      </div>

      {/* ── Tri ───────────────────────────────────────────────────────── */}
      <div className="relative flex items-center">
        <MdSort className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as import("@/features/planner/types/rides.area.types").SortKey)}
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-[#08316e]/25 focus:border-[#08316e]
                     bg-white text-gray-700 cursor-pointer transition"
        >
          <option value="time-asc">
            {isFr ? "Heure ↑ (croissant)"   : "Time ↑ (ascending)"  }
          </option>
          <option value="time-desc">
            {isFr ? "Heure ↓ (décroissant)" : "Time ↓ (descending)" }
          </option>
          <option value="status">
            {isFr ? "Statut (A → Z)"        : "Status (A → Z)"      }
          </option>
        </select>
      </div>

      {/* ── Compteur de résultats ─────────────────────────────────────── */}
      <p className="ml-auto text-sm text-gray-500 whitespace-nowrap">
        <span className="font-semibold text-[#08316e]">{visibleCount}</span>
        {" "}
        {isFr
          ? `trajet${visibleCount !== 1 ? "s" : ""}`
          : `ride${visibleCount !== 1    ? "s" : ""}`}
        {hasActiveFilter && (
          <span className="text-gray-400">
            {" "}/ {totalCount}{" "}
            {isFr ? "au total" : "total"}
          </span>
        )}
      </p>
    </div>
  );
}
