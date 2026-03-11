"use client";

/**
 * @file RidesAreaHeader.tsx
 * @description Bandeau de navigation par jour du planificateur :
 * boutons précédent / suivant, affichage de la date courante et
 * lien de retour à aujourd'hui.
 */

import { FaChevronLeft, FaChevronRight, FaCalendarDay } from "react-icons/fa";

import { formatDate }                   from "@/core/utils/date.utils";
import type { RidesAreaHeaderProps }    from "@/features/planner/types/rides.area.types";

/**
 * Affiche le bandeau de navigation par jour avec :
 * - flèche précédent
 * - date courante (formatée + localisée)
 * - lien "Revenir à aujourd'hui" (masqué si déjà aujourd'hui)
 * - flèche suivant
 */
export function RidesAreaHeader({
  isFr,
  currentDay,
  isToday,
  lang,
  onPrevDay,
  onNextDay,
  onToday,
}: RidesAreaHeaderProps) {
  return (
    <div className="shrink-0 w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-100">

      {/* Bouton précédent */}
      <button
        onClick={onPrevDay}
        className="p-2 rounded-full hover:bg-gray-100 text-[#08316e] transition-colors"
        aria-label={isFr ? "Jour précédent" : "Previous day"}
      >
        <FaChevronLeft className="text-xl" />
      </button>

      {/* Date courante */}
      <div className="flex flex-col items-center gap-0.5">
        <h2 className="text-2xl font-bold text-[#08316e]">
          {formatDate(currentDay.toISOString(), lang)}
        </h2>

        <p className="text-sm text-gray-500 capitalize">
          {currentDay.toLocaleDateString(isFr ? "fr-CA" : "en-CA", {
            weekday: "long",
            day:     "2-digit",
            month:   "long",
            year:    "numeric",
          })}
        </p>

        {/* Lien de retour à aujourd'hui — masqué si déjà sur aujourd'hui */}
        {!isToday && (
          <button
            onClick={onToday}
            className="mt-1 flex items-center gap-1 text-xs text-blue-500 hover:underline transition"
          >
            <FaCalendarDay />
            {isFr ? "Revenir à aujourd'hui" : "Back to today"}
          </button>
        )}
      </div>

      {/* Bouton suivant */}
      <button
        onClick={onNextDay}
        className="p-2 rounded-full hover:bg-gray-100 text-[#08316e] transition-colors"
        aria-label={isFr ? "Jour suivant" : "Next day"}
      >
        <FaChevronRight className="text-xl" />
      </button>
    </div>
  );
}
