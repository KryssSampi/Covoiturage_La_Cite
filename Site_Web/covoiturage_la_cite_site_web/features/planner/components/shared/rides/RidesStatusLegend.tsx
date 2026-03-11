"use client";

/**
 * @file RidesStatusLegend.tsx
 * @description Légende des statuts présents dans la journée.
 * Chaque badge est cliquable et sert de filtre rapide.
 */

import type { RidesStatusLegendProps } from "@/features/planner/types/rides.area.types";

/**
 * Affiche les badges colorés de statuts de la journée.
 * Un clic sur un badge active ou désactive le filtre correspondant.
 * S'efface complètement si aucun statut n'est présent dans la journée.
 */
export function RidesStatusLegend({
  isFr,
  statusCounts,
  filterStatus,
  onFilterChange,
}: RidesStatusLegendProps) {
  // Masquer la légende si aucun trajet n'est présent dans la journée
  if (statusCounts.length === 0) return null;

  return (
    <div className="shrink-0 w-full bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap items-center gap-2">

      {/* Libellé de section */}
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
        {isFr ? "Statuts du jour" : "Day statuses"}
      </span>

      {/* Badges de statuts */}
      {statusCounts.map(sc => (
        <button
          key={sc.status}
          onClick={() => onFilterChange(filterStatus === sc.status ? "all" : sc.status)}
          title={
            filterStatus === sc.status
              ? isFr ? "Retirer le filtre" : "Remove filter"
              : isFr ? `Filtrer : ${sc.label}` : `Filter: ${sc.label}`
          }
          className={[
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white",
            "transition hover:opacity-90 active:scale-95 select-none",
            filterStatus === sc.status ? "ring-2 ring-offset-1 ring-gray-500" : "",
          ].join(" ")}
          style={{ backgroundColor: sc.hex }}
        >
          {/* Indicateur actif / inactif */}
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              filterStatus === sc.status ? "bg-white" : "bg-white/50"
            }`}
          />
          {sc.label}
          {/* Compteur */}
          <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-xs leading-none">
            {sc.count}
          </span>
        </button>
      ))}

      {/* Bouton réinitialisation du filtre */}
      {filterStatus !== "all" && (
        <button
          onClick={() => onFilterChange("all")}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline ml-1 transition"
        >
          {isFr ? "× Tout afficher" : "× Show all"}
        </button>
      )}
    </div>
  );
}
