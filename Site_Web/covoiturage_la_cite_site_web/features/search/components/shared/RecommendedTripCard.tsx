"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaStar, FaLocationDot, FaArrowRight } from "react-icons/fa6";
import { FaPlusCircle, FaUserFriends } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import type { Trip } from "@/features/dashboard/types";
import type { MatchingScore, BlockedTripReason } from "@/features/search/types/search.feature.types";
import { PassengerAvatars } from "@/shared/components/PassengerAvatars";

function matchColor(score: number, isFR: boolean): {
  bg: string;
  ring: string;
  text: string;
  label: string;
} {
  if (score >= 80) return { bg: "#e8f5e9", ring: "#2e7d32", text: "#1b5e20", label: "Excellent" };
  if (score >= 60) return { bg: "#e3f2fd", ring: "#1565c0", text: "#0d47a1", label: isFR ? "Bon match" : "Good match" };
  if (score >= 40) return { bg: "#fff8e1", ring: "#f57f17", text: "#e65100", label: isFR ? "Passable" : "Fair" };
  return { bg: "#fce4ec", ring: "#c62828", text: "#b71c1c", label: isFR ? "Faible" : "Weak" };
}

function blockedReasonLabel(reason: BlockedTripReason | undefined, isFR: boolean): string {
  switch (reason) {
    case "trip_full": return isFR ? "Trajet complet" : "Trip is full";
    case "already_passenger": return isFR ? "Vous etes deja sur ce trajet" : "Already joined";
    case "geo_departure_too_far": return isFR ? "Depart trop eloigne" : "Departure too far";
    case "geo_arrival_too_far": return isFR ? "Arrivee trop eloignee" : "Arrival too far";
    case "payment_incompatible": return isFR ? "Paiement incompatible" : "Payment mismatch";
    case "goscore_too_low": return isFR ? "GoScore insuffisant" : "GoScore too low";
    case "bad_past_experience": return isFR ? "Experience passee negative" : "Past affinity issue";
    case "passenger_unreliable": return isFR ? "Profil passager a risque" : "Passenger risk";
    case "trip_not_published": return isFR ? "Trajet non publie" : "Trip not published";
    default: return isFR ? "Resultat bloque" : "Blocked result";
  }
}

export interface RecommendedTripCardProps {
  trip: Trip;
  score?: MatchingScore;
  isSelected?: boolean;
  onSelect?: (trip: Trip) => void;
  onReserve?: (tripId: string) => void;
  blockedReason?: BlockedTripReason;
}

export function RecommendedTripCard({
  trip,
  score,
  isSelected = false,
  onSelect,
  onReserve,
  blockedReason,
}: RecommendedTripCardProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const router = useRouter();
  const [isPassengerListOpen, setIsPassengerListOpen] = useState(false);

  const seatsLeft = trip.maxPassengers - trip.passengers.length;
  const isBlocked = Boolean(blockedReason);
  const isFull = seatsLeft <= 0 || isBlocked;
  const mc = score ? matchColor(score.total, isFR) : null;

  function handleReserve(e: React.MouseEvent) {
    e.stopPropagation();
    if (isBlocked) return;
    if (onReserve) {
      onReserve(trip.id);
    } else {
      router.push(`/trajets/${trip.id}`);
    }
  }

  return (
    <div
      className="w-full flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-2 hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.99] relative overflow-visible"
      style={{
        cursor: onSelect ? "pointer" : "default",
        outline: isSelected ? "2.5px solid #08316e" : "none",
        boxShadow: isSelected
          ? "0 0 0 3px #08316e33, 0 6px 24px rgba(8,49,110,0.18)"
          : undefined,
        background: isSelected ? "#eef4ff" : undefined,
        opacity: isBlocked ? 0.92 : 1,
      }}
      onClick={() => onSelect?.(trip)}
    >
      {mc && score && (
        <div
          className="absolute top-3 right-3 flex flex-col items-center rounded-xl px-2 py-1 z-10"
          style={{ background: mc.bg, border: `1.5px solid ${mc.ring}55` }}
          title={`Score: ${score.total}/100`}
        >
          <span className="text-base font-extrabold leading-none" style={{ color: mc.text }}>
            {score.total}
          </span>
          <span className="text-[9px] font-bold tracking-wide uppercase" style={{ color: mc.text }}>
            {mc.label}
          </span>
        </div>
      )}

      {isBlocked && (
        <div
          className="absolute top-3 left-3 rounded-full px-3 py-1 z-10"
          style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #f59e0b55" }}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wide">
            {isFR ? "Bloque" : "Blocked"}
          </span>
        </div>
      )}

      <div className="shrink-0">
        <Image
          src={trip.driver.pictureUrl || "/assets/placeholder/placeholer-profile-picture.png"}
          alt={trip.driver.name}
          className="w-24 h-32 rounded-xl object-cover"
          width={200}
          height={280}
        />
      </div>

      <div className="w-px h-28 bg-gray-400 shrink-0" />

      <div className="flex flex-col items-start w-full pr-28 gap-0.5">
        <span className="text-lg font-semibold text-black">
          {formatDate(trip.date, lang)}&nbsp;:&nbsp;{trip.time}
        </span>

        <div className="flex items-center text-black text-base gap-2 flex-wrap">
          <span className="text-gray-600 text-sm">{isFR ? "Avec :" : "With:"}</span>
          <Link
            href={`/public-profile?accountid=${trip.driver.id}`}
            className="text-base font-semibold truncate max-w-40 text-blue-500 hover:text-blue-700 hover:underline"
            title={trip.driver.name}
          >
            {trip.driver.name}
          </Link>
          <span className="text-yellow-400 text-sm flex gap-1 items-center">
            <FaStar />
            <strong className="text-gray-800">{trip.driver.rating.toFixed(1)}</strong>
            <span className="text-gray-500 text-xs">
              ({trip.driver.tripsCount} {isFR ? "trajets" : "trips"})
            </span>
          </span>
        </div>

        <p className="flex gap-1 items-baseline text-base text-[#08316e]">
          <FaLocationDot className="shrink-0 mt-0.5" />
          <span className="truncate max-w-28 text-black font-bold" title={trip.departure}>
            {trip.departure}
          </span>
          <FaArrowRight className="mx-2 shrink-0" />
          <span className="truncate max-w-28 text-black font-bold" title={trip.destination}>
            {trip.destination}
          </span>
        </p>

        {isBlocked && (
          <p className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-1">
            {blockedReasonLabel(blockedReason, isFR)}
          </p>
        )}

        <div className="w-full flex justify-between items-center flex-wrap gap-2">
          <PassengerAvatars
            passengers={trip.passengers}
            isOpen={isPassengerListOpen}
            onToggle={() => setIsPassengerListOpen((v) => !v)}
            onClose={() => setIsPassengerListOpen(false)}
            withBorder
          />

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1">
              <span className={`text-base font-semibold ${isFull ? "text-red-500" : "text-gray-700"}`}>
                {trip.passengers.length}/{trip.maxPassengers}
              </span>
              <FaUserFriends className="text-[#08316e] text-lg" />
              {!isFull && (
                <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                  {seatsLeft} {isFR
                    ? `place${seatsLeft > 1 ? "s" : ""} libre${seatsLeft > 1 ? "s" : ""}`
                    : `seat${seatsLeft > 1 ? "s" : ""} free`}
                </span>
              )}
              {isFull && (
                <span className="text-xs font-bold text-red-700 bg-red-100 rounded-full px-2 py-0.5">
                  {isBlocked ? (isFR ? "Bloque" : "Blocked") : (isFR ? "Complet" : "Full")}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {isFR ? "Prix" : "Price"}
              </span>
              <span className="text-lg font-extrabold text-red-500">
                {trip.price}&nbsp;<span className="text-xs font-semibold text-gray-500">CAD</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center shrink-0 w-24">
        <button
          disabled={isFull}
          className="w-full font-bold py-2 px-3 rounded-full text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          style={{
            background: isFull ? "#94a3b8" : "#08316e",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            if (!isFull) e.currentTarget.style.background = "#06214a";
          }}
          onMouseLeave={(e) => {
            if (!isFull) e.currentTarget.style.background = "#08316e";
          }}
          onClick={handleReserve}
        >
          <FaPlusCircle />
          {isBlocked
            ? (isFR ? "Indisponible" : "Unavailable")
            : isFull
            ? (isFR ? "Complet" : "Full")
            : (isFR ? "Reserver" : "Book")}
        </button>
      </div>
    </div>
  );
}
