"use client";

import { FaLocationDot, FaArrowRight, FaCalendarDays, FaClock, FaUser, FaDollarSign } from "react-icons/fa6";
import { type Reservation } from "@/features/dashboard/types";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

interface ReservationDetailCardProps {
  reservation: Reservation;
  role: "driver" | "passenger";
}

/**
 * Carte de detail d'une reservation.
 * Affiche les infos cles : route, date/heure, interlocuteur, prix et statut.
 * Le champ "interlocuteur" change selon le role :
 *   - driver -> nom du passager (premier de la liste)
 *   - passenger -> nom du conducteur
 */
export function ReservationDetailCard({ reservation, role }: ReservationDetailCardProps) {
  const interlocuteur =
    role === "passenger"
      ? reservation.driver.name
      : reservation.passengers[0]?.name ?? "—";
  const interlocuteurLabel = role === "passenger" ? "Conducteur" : "Passager";
  const priceLike = reservation as Reservation & { price?: number; pricePerSeat?: number; totalAmount?: number };
  const priceValue = priceLike.totalAmount ?? priceLike.price ?? priceLike.pricePerSeat;
  const priceLabel = typeof priceValue === "number" ? `${priceValue.toFixed(2)} CAD` : "—";

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Route */}
      <div className="flex items-center gap-2 text-sm font-semibold text-[#08316e]">
        <FaLocationDot size={13} />
        <span className="truncate max-w-30">{reservation.departure}</span>
        <FaArrowRight size={11} className="shrink-0 text-gray-400" />
        <span className="truncate max-w-30">{reservation.destination}</span>
      </div>

      {/* Date + heure */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FaCalendarDays size={11} color="#08316e" />
          {reservation.date}
        </span>
        <span className="flex items-center gap-1">
          <FaClock size={11} color="#08316e" />
          {reservation.time}
        </span>
      </div>

      {/* Interlocuteur */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <FaUser size={11} color="#08316e" />
        <span className="font-semibold text-gray-700">{interlocuteurLabel} :</span>
        <span>{interlocuteur}</span>
      </div>

      {/* Prix */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <FaDollarSign size={11} color="#08316e" />
        <span className="font-semibold text-gray-700">Prix :</span>
        <span>{priceLabel}</span>
      </div>

      {/* Statut */}
      <div className="flex justify-end">
        <ReservationStatusBadge status={reservation.status} size="sm" />
      </div>
    </div>
  );
}
