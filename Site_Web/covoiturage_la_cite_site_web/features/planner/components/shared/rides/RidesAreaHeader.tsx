"use client";

/**
 * @file RidesAreaHeader.tsx
 * @description Bandeau de navigation par jour du planificateur :
 * boutons précédent / suivant, affichage de la date courante,
 * lien de retour à aujourd'hui et bouton « Voir tout ».
 */

import { FaChevronLeft, FaChevronRight, FaCalendarDay } from "react-icons/fa";
import { FaListUl } from "react-icons/fa6";

import { formatDate }                   from "@/core/utils/date.utils";
import type { RidesAreaHeaderProps }    from "@/features/planner/types/rides.area.types";

/**
 * Affiche le bandeau de navigation par jour avec :
 * - flèche précédent / suivant
 * - date courante ou « Tous les trajets » en mode "voir tout"
 * - lien "Revenir à aujourd'hui"
 * - bouton toggle "Voir tout"
 */
export function RidesAreaHeader({
  isFr,
  currentDay,
  isToday,
  lang,
  showAll,
  onPrevDay,
  onNextDay,
  onToday,
  onToggleShowAll,
}: RidesAreaHeaderProps) {
  return (
    <div className="shrink-0 w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-100">

      {/* Bouton précédent — masqué en mode "voir tout" */}
      <button
        onClick={onPrevDay}
        className={`p-2 rounded-full hover:bg-gray-100 text-[#08316e] transition-colors ${showAll ? "invisible" : ""}`}
        aria-label={isFr ? "Jour précédent" : "Previous day"}
        disabled={showAll}
      >
        <FaChevronLeft className="text-xl" />
      </button>

      {/* Date courante ou « Tous les trajets » */}
      <div className="flex flex-col items-center gap-0.5">
        {showAll ? (
          <h2 className="text-2xl font-bold text-[#08316e]">
            {isFr ? "Tous les trajets" : "All rides"}
          </h2>
        ) : (
          <>
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
          </>
        )}

        {/* Actions sous le titre */}
        <div className="flex items-center gap-3 mt-1">
          {/* Lien de retour à aujourd'hui — masqué si déjà sur aujourd'hui ou en mode "voir tout" */}
          {!isToday && !showAll && (
            <button
              onClick={onToday}
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline transition"
            >
              <FaCalendarDay />
              {isFr ? "Revenir à aujourd'hui" : "Back to today"}
            </button>
          )}

          {/* Bouton toggle "Voir tout" */}
          <button
            onClick={onToggleShowAll}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
              showAll
                ? "bg-[#08316e] text-white"
                : "bg-gray-100 text-[#08316e] hover:bg-gray-200"
            }`}
          >
            <FaListUl size={10} />
            {showAll
              ? (isFr ? "Vue par jour" : "Day view")
              : (isFr ? "Voir tout" : "View all")}
          </button>
        </div>
      </div>

      {/* Bouton suivant — masqué en mode "voir tout" */}
      <button
        onClick={onNextDay}
        className={`p-2 rounded-full hover:bg-gray-100 text-[#08316e] transition-colors ${showAll ? "invisible" : ""}`}
        aria-label={isFr ? "Jour suivant" : "Next day"}
        disabled={showAll}
      >
        <FaChevronRight className="text-xl" />
      </button>
    </div>
  );
}
