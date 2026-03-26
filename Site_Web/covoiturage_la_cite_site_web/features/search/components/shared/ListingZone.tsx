"use client";

import { useEffect, useMemo, useState } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { Trip } from "@/features/dashboard/types/trip.types";
import { MapCircuit, SearchRole, MatchingScore, TripWithCoords } from "@/features/search/types/search.feature.types";
import { RecommendedTripCard } from "./RecommendedTripCard";
import { MapCircuitCard } from "./MapCircuitCard";
import { FaMagnifyingGlass, FaMapLocationDot, FaBell, FaCheck } from "react-icons/fa6";

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
  onReserveTrip?: (tripId: string) => void;
  departureLabel?: string;
  arrivalLabel?: string;
  departureCoords?: [number, number] | null;
  arrivalCoords?: [number, number] | null;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}

interface EmptyStateProps {
  role: SearchRole;
  departureLabel?: string;
  arrivalLabel?: string;
  departureCoords?: [number, number] | null;
  arrivalCoords?: [number, number] | null;
  compact?: boolean;
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
  onReserveTrip,
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
        onReserveTrip={onReserveTrip}
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
        <EmptyState role="driver" />
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
  onReserveTrip,
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
  onReserveTrip?: (tripId: string) => void;
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

  const [openedCount, setOpenedCount] = useState(bestTrips.length > 0 ? 1 : 0);

  useEffect(() => {
    setOpenedCount(bestTrips.length > 0 ? 1 : 0);
  }, [bestTrips.length, otherTrips.length, blockedTripsMatchingGeo.length]);

  const visibleSections = sections.slice(0, openedCount);
  const nextSection = sections[openedCount];
  const allShown = openedCount >= sections.length;
  const canCreateAlert = Boolean(departureLabel && arrivalLabel);

  const sectionTitle = (id: PassengerSectionId) => {
    if (id === "best") return isFR ? "Meilleurs resultats" : "Best results";
    if (id === "other") return isFR ? "Autres resultats" : "More results";
    return isFR ? "Resultats bloques" : "Blocked results";
  };

  const sectionLead = (id: PassengerSectionId) => {
    if (id === "other") {
      return isFR
        ? "D'autres resultats sont disponibles mais ne correspondent pas totalement a votre recherche."
        : "More results are available but do not fully match your search.";
    }
    if (id === "blocked") {
      return isFR
        ? "Des resultats existent encore, mais ils sont actuellement bloques par certaines contraintes."
        : "More results exist, but they are currently blocked by some constraints.";
    }
    return isFR ? "Des resultats sont disponibles." : "Results are available.";
  };

  const nextButtonLabel = (id: PassengerSectionId) => {
    if (id === "other") {
      return isFR ? "Voir plus de resultats" : "See more results";
    }
    if (id === "blocked") {
      return isFR ? "Voir les resultats bloques" : "See blocked results";
    }
    return isFR ? "Voir les meilleurs resultats" : "See best results";
  };

  if (visibleSections.length === 0 && !nextSection) {
    return (
      <EmptyState
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
          <p
            style={{
              margin: section.id === visibleSections[0]?.id ? "0 0 2px" : "12px 0 2px",
              fontSize: 12,
              fontWeight: 800,
              color: section.id === "blocked" ? "#9a3412" : "#08316e",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {sectionTitle(section.id)}
          </p>

          {section.trips.map((trip) => (
            <RecommendedTripCard
              key={`${section.id}-${trip.id}`}
              trip={trip}
              score={scores?.get(trip.id)}
              isSelected={selectedTripId === trip.id}
              onSelect={onSelectTrip}
              onReserve={onReserveTrip}
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
          <EmptyState
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

function EmptyState({
  role,
  departureLabel,
  arrivalLabel,
  departureCoords,
  arrivalCoords,
  compact = false,
}: EmptyStateProps) {
  const [alertCreated, setAlertCreated] = useState(false);
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const handleCreateAlert = () => {
    if (!departureLabel || !arrivalLabel) return;
    const wishingAlerts = JSON.parse(sessionStorage.getItem("wishingAlerts") ?? "[]");
    wishingAlerts.push({
      id: `wish-${Date.now()}`,
      departure: departureLabel,
      destination: arrivalLabel,
      departureCoords,
      arrivalCoords,
      createdAt: new Date().toISOString(),
    });
    sessionStorage.setItem("wishingAlerts", JSON.stringify(wishingAlerts));
    setAlertCreated(true);
  };

  const canCreateAlert = role === "passenger" && departureLabel && arrivalLabel;

  return (
    <div
      style={{
        padding: compact ? "8px 0" : "40px 16px",
        textAlign: "center",
        color: "#90a4c0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {!compact && (
        <>
          <div style={{ fontSize: 36, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {role === "passenger"
              ? <FaMagnifyingGlass size={36} color="#90a4c0" />
              : <FaMapLocationDot size={36} color="#90a4c0" />}
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#5a6a85", marginBottom: 6 }}>
            {role === "passenger"
              ? (isFR ? "Aucun trajet trouve dans cette zone." : "No trip found in this area.")
              : (isFR ? "Lance une recherche pour voir les circuits." : "Start a search to see circuits.")}
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.5, marginBottom: canCreateAlert ? 16 : 0 }}>
            {role === "passenger"
              ? (isFR ? "Elargis le rayon de recherche ou modifie tes criteres." : "Expand the search radius or change your criteria.")
              : (isFR ? "Saisis un depart et une destination, puis clique sur Rechercher." : "Enter a departure and destination, then click Search.")}
          </p>
        </>
      )}

      {compact && canCreateAlert && !alertCreated && (
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#5a6a85" }}>
          {isFR
            ? "Tous les niveaux de resultats ont ete affiches. Vous pouvez maintenant creer une alerte."
            : "All result levels have been displayed. You can now create an alert."}
        </p>
      )}

      {canCreateAlert && !alertCreated && (
        <button
          onClick={handleCreateAlert}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            background: "#08316e",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0a4a9e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#08316e")}
        >
          <FaBell size={14} />
          {isFR ? "Creer une alerte pour ce trajet" : "Create an alert for this trip"}
        </button>
      )}

      {canCreateAlert && alertCreated && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            background: "#16a34a",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <FaCheck size={14} />
          {isFR
            ? "Alerte creee. Vous serez notifie quand un trajet correspondra."
            : "Alert created. You will be notified when a matching trip is found."}
        </div>
      )}
    </div>
  );
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
