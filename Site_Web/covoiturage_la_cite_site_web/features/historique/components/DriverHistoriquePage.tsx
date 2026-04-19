"use client";

/**
 * Page de listing de l'historique des trajets publiés du conducteur.
 * Utilise ListDetailPage avec le hook useDriverHistoriqueList.
 * Carte basée sur le visuel de PublishedTripCard du dashboard.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { FaUserFriends, FaArrowRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import { getPublishedTripStatusLabel, getPublishedTripStatusColor } from "@/shared/utils/status.utils";
import { type PublishedTrip } from "@/features/dashboard/types";
import { useDriverHistoriqueConfig } from "../hooks/useDriverHistoriqueList";

// ─── Props du composant (données fournies par la page route) ──────────────

interface DriverHistoriquePageProps {
  items: PublishedTrip[];
}

// ─── Carte de trajet publié pour le listing ──────────────────────────────────

function PublishedTripListCard({ trip, lang }: { trip: PublishedTrip; lang: Language }) {
  return (
    <div className="flex items-center gap-3 p-3 opacity-50 grayscale">
      {/* Infos */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[15px] font-semibold text-black truncate">
          {formatDate(trip.date, lang)} — {trip.time}
        </span>
        <p className="flex items-center gap-1 text-[15px] text-[#08316e] mt-0.5">
          <FaLocationDot size={15} />
          <span className="truncate max-w-20">{trip.departure}</span>
          <FaArrowRight size={15} />
          <span className="truncate max-w-20">{trip.destination}</span>
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-1 text-[15px] text-gray-500">
            {Array.isArray(trip.passengers) ? trip.passengers.length : (trip.passengers ?? 0)}/{trip.maxPassengers ?? "?"}
            <FaUserFriends size={15} className="text-[#08316e]" />
          </span>
          <span className="text-[15px] font-bold text-green-500">{trip.price} CAD</span>
        </div>
      </div>

      {/* Badge statut */}
      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getPublishedTripStatusColor(trip.status)}`}>
        {getPublishedTripStatusLabel(trip.status, lang)}
      </span>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function DriverHistoriquePage({ items }: DriverHistoriquePageProps) {
  const { lang } = useAppState();
  const { filterGroups, sortOptions, searchKeys, emptyMessage } = useDriverHistoriqueConfig();
  const [isLoading, setIsLoading] = useState(items.length === 0);
  const hasItemsUpdateRef = useRef(false);

  useEffect(() => {
    if (!hasItemsUpdateRef.current) {
      hasItemsUpdateRef.current = true;
      return;
    }
    setIsLoading(false);
  }, [items]);

  const renderCard = useCallback(
    (trip: PublishedTrip) => <PublishedTripListCard trip={trip} lang={lang} />,
    [lang],
  );

  return (
    <ListDetailPage
      isLoading={isLoading}
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
