"use client";

import { Trip } from "@/features/dashboard/types/trip.types";
import { MatchingScore, TripWithCoords } from "@/features/search/types/search.feature.types";
import { RecommendedTripCard } from "../RecommendedTripCard";

interface TripCardProps {
  trip: TripWithCoords;
  score?: MatchingScore;
  isSelected?: boolean;
  onSelect?: (trip: Trip) => void;
  /** Statut de la réservation active du passager pour ce trip (pending/confirmed/in_progress) */
  existingReservationStatus?: string;
  blockedReason?: TripWithCoords["blockedReason"];
}

export function TripCard({
  trip,
  score,
  isSelected,
  onSelect,
  existingReservationStatus,
  blockedReason,
}: TripCardProps) {
  return (
    <RecommendedTripCard
      trip={trip}
      score={score}
      isSelected={isSelected}
      onSelect={onSelect}
      existingReservationStatus={existingReservationStatus}
      blockedReason={blockedReason}
    />
  );
}
