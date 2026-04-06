/**
 * Composant ProfileTripCard
 * Carte de trajet pour la section "Trajets disponibles" du profil public
 * Inspiré des Recommended Trip Cards du dashboard
 * Inclut le bouton Réserver avec navigation vers la page du trajet
 */

"use client";

import { FaArrowRight, FaCirclePlus, FaLocationDot } from "react-icons/fa6";
import { formatDate } from "@/core/utils/date.utils";
import { Language, useAppState } from "@/core/state/app_state";

export interface ProfileTripCardProps {
  id: string;
  departureLabel: string;
  arrivalLabel: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerPassenger: number;
  onReserve: (tripId: string) => void;
}

export function ProfileTripCard({
  id,
  departureLabel,
  arrivalLabel,
  departureDate,
  departureTime,
  availableSeats,
  pricePerPassenger,
  onReserve,
}: ProfileTripCardProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md">
      {/* Informations du trajet */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Trajet */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <FaLocationDot size={12} className="shrink-0 text-blue-500" />
          <span className="truncate">{departureLabel}</span>
          <FaArrowRight size={10} className="shrink-0 text-gray-400" />
          <span className="truncate">{arrivalLabel}</span>
        </div>

        {/* Date et heure */}
        <p className="text-xs text-gray-400">
          {formatDate(departureDate, lang)} · {departureTime?.substring(0, 5)}
        </p>
      </div>

      {/* Prix et places */}
      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-blue-600">{pricePerPassenger}$</p>
          <p className="text-xs text-gray-400">
            {availableSeats} {isFR ? "place" : "seat"}{availableSeats > 1 ? (isFR ? "s" : "s") : ""}
          </p>
        </div>

        {/* Bouton Réserver */}
        <button
          onClick={() => onReserve(id)}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
          aria-label={isFR ? `Réserver le trajet ${departureLabel} → ${arrivalLabel}` : `Book trip ${departureLabel} → ${arrivalLabel}`}
        >
          <FaCirclePlus size={12} />
          {isFR ? "Réserver" : "Book"}
        </button>
      </div>
    </div>
  );
}
