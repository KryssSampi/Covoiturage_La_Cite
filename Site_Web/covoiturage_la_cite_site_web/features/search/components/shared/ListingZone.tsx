"use client";

import { useEffect, useMemo, useState } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { Trip } from "@/features/dashboard/types/trip.types";
import { MapCircuit, SearchRole, MatchingScore, TripWithCoords } from "@/features/search/types/search.feature.types";
import { MapCircuitCard } from "./MapCircuitCard";
import { EmptySearchState } from "./listing-zone/EmptySearchState";
import { TripCard } from "./listing-zone/TripCard";
import { TripListHeader } from "./listing-zone/TripListHeader";

interface ListingZoneProps {
  role: SearchRole;
  trips?: Trip[];
  blockedTrips?: TripWithCoords[];
  circuits?: MapCircuit[];
  activeCircuitIdx?: number;
  isLoading?: boolean;
  scores?: Map<string, MatchingScore>;
  selectedTripId?: string | null;
  onSelectTrip?: (trip: Trip) => void;
  onSelectCircuit?: (idx: number) => void;
  onPublishCircuit?: (circuit: MapCircuit) => void;
  onChooseCircuit?: (circuit: MapCircuit) => void;
  /** Carte tripId → statut de réservation active du passager connecté */
  userReservations?: Map<string, string>;
  departureLabel?: string;
  arrivalLabel?: string;
  departureCoords?: [number, number] | null;
  arrivalCoords?: [number, number] | null;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}

type PassengerSectionId = "best" | "other" | "blocked";

export function ListingZone({
  role,
  trips = [],
  blockedTrips = [],
  circuits = [],
  activeCircuitIdx = 0,
  isLoading = false,
  scores,
  selectedTripId,
  onSelectTrip,
  onSelectCircuit,
  onPublishCircuit,
  onChooseCircuit,
  userReservations,
  departureLabel,
  arrivalLabel,
  departureCoords,
  arrivalCoords,
  departureRadiusMeters,
  arrivalRadiusMeters,
}: ListingZoneProps) {
  if (isLoading) return <LoadingPlaceholder count={role === "driver" ? 3 : 4} />;

  if (role === "passenger") {
    return (
      <PassengerListing
        trips={trips}
        blockedTrips={blockedTrips}
        scores={scores}
        selectedTripId={selectedTripId}
        onSelectTrip={onSelectTrip}
        userReservations={userReservations}
        departureLabel={departureLabel}
        arrivalLabel={arrivalLabel}
        departureCoords={departureCoords}
        arrivalCoords={arrivalCoords}
        departureRadiusMeters={departureRadiusMeters}
        arrivalRadiusMeters={arrivalRadiusMeters}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {circuits.length === 0 ? (
        <EmptySearchState role="driver" />
      ) : (
        circuits.map((circuit, idx) => (
          <MapCircuitCard
            key={`${circuit.routeIndex}-${circuit.departureLabel}`}
            circuit={circuit}
            isActive={idx === activeCircuitIdx}
            onSelect={(routeIdx) => {
              const realIdx = circuits.findIndex((c) => c.routeIndex === routeIdx);
              onSelectCircuit?.(realIdx >= 0 ? realIdx : 0);
            }}
            onPublish={onPublishCircuit}
            onChoose={onChooseCircuit}
          />
        ))
      )}
    </div>
  );
}

function PassengerListing({
  trips,
  blockedTrips,
  scores,
  selectedTripId,
  onSelectTrip,
  userReservations,
  departureLabel,
  arrivalLabel,
  departureCoords,
  arrivalCoords,
  departureRadiusMeters,
  arrivalRadiusMeters,
}: {
  trips: Trip[];
  blockedTrips: TripWithCoords[];
  scores?: Map<string, MatchingScore>;
  selectedTripId?: string | null;
  onSelectTrip?: (trip: Trip) => void;
  userReservations?: Map<string, string>;
  departureLabel?: string;
  arrivalLabel?: string;
  departureCoords?: [number, number] | null;
  arrivalCoords?: [number, number] | null;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const blockedTripsMatchingGeo = useMemo(() => {
    if (!departureCoords || !arrivalCoords) return [];

    return blockedTrips.filter((trip) => {
      if (!trip.departureCoords || !trip.arrivalCoords) return false;

      const departureDistance = haversineMeters(departureCoords, trip.departureCoords);
      const arrivalDistance = haversineMeters(arrivalCoords, trip.arrivalCoords);

      return (
        departureDistance <= (departureRadiusMeters ?? Number.POSITIVE_INFINITY) &&
        arrivalDistance <= (arrivalRadiusMeters ?? Number.POSITIVE_INFINITY)
      );
    });
  }, [
    blockedTrips,
    departureCoords,
    arrivalCoords,
    departureRadiusMeters,
    arrivalRadiusMeters,
  ]);

  const bestTrips = useMemo(
    () => trips.filter((trip) => (scores?.get(trip.id)?.total ?? 0) >= 70),
    [trips, scores]
  );
  const otherTrips = useMemo(
    () => trips.filter((trip) => (scores?.get(trip.id)?.total ?? 0) < 70),
    [trips, scores]
  );

  const sections = useMemo(() => {
    const next: Array<{ id: PassengerSectionId; trips: TripWithCoords[] }> = [];
    if (bestTrips.length > 0) next.push({ id: "best", trips: bestTrips as TripWithCoords[] });
    if (otherTrips.length > 0) next.push({ id: "other", trips: otherTrips as TripWithCoords[] });
    if (blockedTripsMatchingGeo.length > 0) next.push({ id: "blocked", trips: blockedTripsMatchingGeo });
    return next;
  }, [bestTrips, otherTrips, blockedTripsMatchingGeo]);

  // Calculer le nombre initial de sections ouvertes basé sur les meilleurs résultats
  const initialOpenedCount = useMemo(
    () => (bestTrips.length > 0 ? 1 : 0),
    [bestTrips.length]
  );
  const [openedCount, setOpenedCount] = useState(initialOpenedCount);

  const visibleSections = sections.slice(0, openedCount);
  const nextSection = sections[openedCount];
  const allShown = openedCount >= sections.length;
  const canCreateAlert = Boolean(departureLabel && arrivalLabel);

  const sectionTitle = (id: PassengerSectionId) => {
    if (id === "best") return isFR ? "Meilleurs resultats" : "Best results";
    if (id === "other") return isFR ? "Autres resultats" : "More results";
    return isFR ? "Resultats suggeres" : "Suggested results";
  };

  const sectionLead = (id: PassengerSectionId) => {
    if (id === "other") {
      return isFR
        ? "D'autres resultats sont disponibles mais ne correspondent pas totalement a votre recherche."
        : "More results are available but do not fully match your search.";
    }
    if (id === "blocked") {
      return isFR
        ? "Des resultats existent encore, affiches en suggestions."
        : "More results exist and are shown as suggestions.";
    }
    return isFR ? "Des resultats sont disponibles." : "Results are available.";
  };

  const nextButtonLabel = (id: PassengerSectionId) => {
    if (id === "other") {
      return isFR ? "Voir plus de resultats" : "See more results";
    }
    if (id === "blocked") {
      return isFR ? "Voir les resultats suggeres" : "See suggested results";
    }
    return isFR ? "Voir les meilleurs resultats" : "See best results";
  };

  if (visibleSections.length === 0 && !nextSection) {
    return (
      <EmptySearchState
        role="passenger"
        departureLabel={departureLabel}
        arrivalLabel={arrivalLabel}
        departureCoords={departureCoords}
        arrivalCoords={arrivalCoords}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {visibleSections.length === 0 && nextSection && (
        <div style={{ padding: "12px 8px 4px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#5a6a85" }}>
            {sectionLead(nextSection.id)}
          </p>
          <button
            onClick={() => setOpenedCount((prev) => prev + 1)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#08316e",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {isFR ? "Cliquer pour voir plus de resultats" : "Click to see more results"}
          </button>
        </div>
      )}

      {visibleSections.map((section) => (
        <div key={section.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <TripListHeader
            title={sectionTitle(section.id)}
            isFirst={section.id === visibleSections[0]?.id}
            isBlocked={false}
          />

          {section.trips.map((trip) => (
            <TripCard
              key={`${section.id}-${trip.id}`}
              trip={trip}
              score={scores?.get(trip.id)}
              isSelected={selectedTripId === trip.id}
              onSelect={onSelectTrip}
              existingReservationStatus={userReservations?.get(trip.id)}
              blockedReason={section.id === "blocked" ? trip.blockedReason : undefined}
            />
          ))}
        </div>
      ))}

      {nextSection && (
        <div style={{ paddingTop: 6, textAlign: "center" }}>
          <button
            onClick={() => setOpenedCount((prev) => prev + 1)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#08316e",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {nextButtonLabel(nextSection.id)}
          </button>
        </div>
      )}

      {allShown && canCreateAlert && (
        <div style={{ paddingTop: 10 }}>
          <EmptySearchState
            role="passenger"
            departureLabel={departureLabel}
            arrivalLabel={arrivalLabel}
            departureCoords={departureCoords}
            arrivalCoords={arrivalCoords}
            compact
          />
        </div>
      )}
    </div>
  );
}

function haversineMeters([fromLng, fromLat]: [number, number], [toLng, toLat]: [number, number]) {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const fromLatRad = toRadians(fromLat);
  const toLatRad = toRadians(toLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function LoadingPlaceholder({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 100,
            background: "linear-gradient(90deg,#f0f4fb 0%,#e5ecf7 50%,#f0f4fb 100%)",
            backgroundSize: "200% 100%",
            borderRadius: 16,
            animation: "shimmer 1.2s linear infinite",
          }}
        />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
