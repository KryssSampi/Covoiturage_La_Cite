"use client";

/**
 * @file RidesEmptyState.tsx
 * @description État vide : affiché quand aucun trajet ne correspond aux
 * critères actifs (jour vide ou filtres trop restrictifs).
 */

import type { RidesEmptyStateProps } from "@/features/planner/types/rides.area.types";
import { FaCalendarDays } from "react-icons/fa6";

/**
 * Affiche un message contextuel lorsqu'aucun trajet n'est disponible.
 * Propose de réinitialiser les filtres si un filtre actif est la cause.
 */
export function RidesEmptyState({ isFr, isFiltered, onReset }: RidesEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 select-none">

      {/* Icône illustrative */}
      <span className="flex items-center justify-center">
        <FaCalendarDays size={52} color="#9ca3af" aria-label={isFr ? "calendrier" : "calendar"} />
      </span>

      {/* Message principal */}
      <p className="text-lg font-medium text-gray-600 text-center px-6 max-w-sm">
        {isFiltered
          ? isFr
              ? "Aucun trajet ne correspond à vos critères."
              : "No rides match your current filters."
          : isFr
              ? "Aucun trajet prévu pour cette journée."
              : "No rides planned for this day."}
      </p>

      {/* Bouton réinitialiser, visible uniquement si des filtres sont actifs */}
      {isFiltered && (
        <button
          onClick={onReset}
          className="px-5 py-2 text-sm font-semibold text-white bg-[#08316e] rounded-lg
                     hover:bg-[#0a3d84] active:scale-95 transition"
        >
          {isFr ? "Réinitialiser les filtres" : "Reset filters"}
        </button>
      )}
    </div>
  );
}
