"use client";

/**
 * Page de listing de l'historique des trajets du passager.
 * Utilise ListDetailPage avec le hook usePassengerHistoriqueList.
 * Carte basée sur le visuel de la section trajets du dashboard.
 */

import { useCallback } from "react";
import Image from "next/image";
import { FaStar, FaUserFriends, FaArrowRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { Trip } from "@/features/dashboard/types/trip.types";
import { usePassengerHistoriqueConfig } from "../hooks/usePassengerHistoriqueList";

// ─── Props du composant (données fournies par la page route) ──────────────

interface PassengerHistoriquePageProps {
  items: Trip[];
}

// ─── Constante de fallback pour les photos de profil ─────────────────────────
const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// ─── Carte de trajet pour le listing passager ────────────────────────────────

function TripListCard({ trip, lang }: { trip: Trip; lang: Language }) {
  return (
    <div className="flex items-center gap-3 p-3 opacity-50 grayscale">
      {/* Photo conducteur */}
      <Image
        src={trip.driver.pictureUrl || AVATAR_FALLBACK}
        alt={trip.driver.name}
        className="w-24 h-24 rounded-full object-cover shrink-0"
        width={96}
        height={96}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
      />

      {/* Infos */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[15px] font-semibold text-black truncate">
          {formatDate(trip.date, lang)} — {trip.time}
        </span>
        <div className="flex items-center gap-1 text-[15px] text-gray-600">
          <span className="truncate">{trip.driver.name}</span>
          <FaStar className="text-yellow-400 shrink-0" size={15} />
          <span>{trip.driver.rating}</span>
        </div>
        <p className="flex items-center gap-1 text-[15px] text-[#08316e]">
          <FaLocationDot size={15} />
          <span className="truncate max-w-20">{trip.departure}</span>
          <FaArrowRight size={15} />
          <span className="truncate max-w-20">{trip.destination}</span>
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-1 text-[15px] text-gray-500">
            {trip.passengers.length}/{trip.maxPassengers}
            <FaUserFriends size={15} className="text-[#08316e]" />
          </span>
          <span className="text-[15px] font-bold text-green-500">{trip.price} CAD</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function PassengerHistoriquePage({ items }: PassengerHistoriquePageProps) {
  const { lang } = useAppState();
  const { filterGroups, sortOptions, searchKeys, emptyMessage } = usePassengerHistoriqueConfig();

  const renderCard = useCallback(
    (trip: Trip) => <TripListCard trip={trip} lang={lang} />,
    [lang],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      filterGroups={filterGroups}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      withOverview={false}
      emptyMessage={emptyMessage}
    />
  );
}
