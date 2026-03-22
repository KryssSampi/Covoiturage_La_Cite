"use client";

/**
 * Page de listing des réservations du passager.
 * Utilise ListDetailPage avec le hook usePassengerReservationsList.
 * Le panneau détail affiche la page trajet complète (PublishedTripView)
 * avec le bouton réservé correspondant à l'état de la demande.
 */

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaUserFriends, FaArrowRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import { PassengerAvatars } from "@/shared/components/PassengerAvatars";
import { getReservationStatusLabel, getReservationStatusClasses } from "@/shared/utils/status.utils";
import { ReservationStatus, type Reservation } from "@/features/dashboard/types";
import { PublishedTripView } from "@/features/trajets/components/published-trip";
import { MOCK_PUBLISHED_TRIP } from "@/features/trajets/fixtures/published-trip.fixtures";
import type { ReservationStatus as ViewReservationStatus, TripViewSource } from "@/features/trajets/types/published-trip.view.types";
import { usePassengerReservationsList } from "../hooks/usePassengerReservationsList";

// ─── Constante de fallback pour les photos de profil ─────────────────────────
const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// ─── Mapping statut réservation → statut vue trajet ──────────────────────────

function mapReservationStatus(status: ReservationStatus): ViewReservationStatus {
  switch (status) {
    case ReservationStatus.Confirmed:  return "confirmed";
    case ReservationStatus.Pending:    return "pending";
    case ReservationStatus.Cancelled:  return "cancelled";
    case ReservationStatus.Completed:  return "confirmed";
    case ReservationStatus.InProgress: return "confirmed";
    default:                           return "none";
  }
}

// ─── Carte de réservation pour le listing ────────────────────────────────────

function ReservationListCard({ reservation, lang }: { reservation: Reservation; lang: Language }) {
  return (
    <div className="flex items-center gap-3 p-3">
      {/* Photo conducteur */}
      <Image
        src={reservation.driver.pictureUrl || AVATAR_FALLBACK}
        alt={reservation.driver.name}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
        width={48}
        height={48}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
      />

      {/* Infos */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold text-black truncate">
          {formatDate(reservation.date, lang)} — {reservation.time}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span className="truncate">{reservation.driver.name}</span>
          <FaStar className="text-yellow-400 shrink-0" size={10} />
          <span>{reservation.driver.rating}</span>
        </div>
        <p className="flex items-center gap-1 text-xs text-[#08316e]">
          <FaLocationDot size={10} />
          <span className="truncate max-w-20">{reservation.departure}</span>
          <FaArrowRight size={8} />
          <span className="truncate max-w-20">{reservation.destination}</span>
        </p>
        <div className="flex items-center justify-between mt-1">
          <PassengerAvatars passengers={reservation.passengers} avatarSize={32} dropdownAvatarSize={24} />
          <span className="flex items-center gap-1 text-xs text-gray-500">
            {reservation.passengers.length}/{reservation.maxPassengers}
            <FaUserFriends size={12} className="text-[#08316e]" />
          </span>
        </div>
      </div>

      {/* Badge statut */}
      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getReservationStatusClasses(reservation.status)}`}>
        {getReservationStatusLabel(reservation.status, lang)}
      </span>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function PassengerReservationsPage() {
  const { lang } = useAppState();
  const { items, filterGroups, sortOptions, searchKeys, emptyMessage } = usePassengerReservationsList();

  // Rendu de la carte de réservation dans le listing
  const renderCard = useCallback(
    (reservation: Reservation) => (
      <ReservationListCard reservation={reservation} lang={lang} />
    ),
    [lang],
  );

  // Rendu détail : page trajet complète avec bouton correspondant à l'état de la demande
  const renderDetail = useCallback(
    (reservation: Reservation) => {
      // Construire les données de trajet à partir de la réservation
      const tripData = {
        ...MOCK_PUBLISHED_TRIP,
        id: String(reservation.id),
        departure: {
          ...MOCK_PUBLISHED_TRIP.departure,
          label: reservation.departure,
          fullAddress: reservation.departure,
        },
        arrival: {
          ...MOCK_PUBLISHED_TRIP.arrival,
          label: reservation.destination,
          fullAddress: reservation.destination,
        },
        driver: {
          id: String(reservation.driver.id),
          firstName: reservation.driver.name,
          avatarUrl: reservation.driver.pictureUrl,
          rating: reservation.driver.rating,
          tripCount: reservation.driver.tripsCount,
        },
        departureDate: formatDate(reservation.date, lang),
        departureTime: reservation.time,
        availableSeats: reservation.maxPassengers - reservation.passengers.length,
        totalSeats: reservation.maxPassengers,
      };

      const viewStatus = mapReservationStatus(reservation.status);

      // Source de navigation pour afficher les boutons contextuels
      const source: TripViewSource = 'reservation';

      return (
        <PublishedTripView
          trip={tripData}
          viewerRole="passenger"
          existingReservation={
            viewStatus !== "none"
              ? { status: viewStatus, updatedAt: new Date().toISOString() }
              : undefined
          }
          source={source}
          sourceStatus={reservation.status}
        />
      );
    },
    [lang],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      renderDetail={renderDetail}
      filterGroups={filterGroups}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      withOverview={true}
      emptyMessage={emptyMessage}
      itemParamKey="reservationid"
    />
  );
}
