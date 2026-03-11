"use client";

/**
 * @file ListingZone.tsx  (v2)
 * @description Zone de listing — passe les scores aux PassengerTripCard.
 */

import { Trip } from "@/features/dashboard/types/trip.types";
import { MapCircuit, SearchRole, MatchingScore } from "@/features/search/types/search.feature.types";
import { RecommendedTripCard } from "./RecommendedTripCard";
import { MapCircuitCard }      from "./MapCircuitCard";

interface ListingZoneProps {
  role:              SearchRole;
  trips?:            Trip[];
  circuits?:         MapCircuit[];
  activeCircuitIdx?: number;
  isLoading?:        boolean;
  scores?:           Map<number, MatchingScore>;
  /** ID du trajet actuellement sélectionné (polyline affichée sur la carte) */
  selectedTripId?:   number | null;
  /** Callback déclenché au clic sur une carte passager */
  onSelectTrip?:     (trip: Trip) => void;
  onSelectCircuit?:  (idx: number) => void;
  onPublishCircuit?: (circuit: MapCircuit) => void;
  onReserveTrip?:    (tripId: number) => void;
}

export function ListingZone({
  role,
  trips            = [],
  circuits         = [],
  activeCircuitIdx = 0,
  isLoading        = false,
  scores,
  selectedTripId,
  onSelectTrip,
  onSelectCircuit,
  onPublishCircuit,
  onReserveTrip,
}: ListingZoneProps) {
  if (isLoading) return <LoadingPlaceholder count={role === "driver" ? 3 : 4} />;

  if (role === "passenger") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {trips.length === 0 ? (
          <EmptyState role="passenger" />
        ) : (
          trips.map((trip) => (
            <RecommendedTripCard
              key={trip.id}
              trip={trip}
              score={scores?.get(trip.id)}
              isSelected={selectedTripId === trip.id}
              onSelect={onSelectTrip}
              onReserve={onReserveTrip}
            />
          ))
        )}
      </div>
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
          />
        ))
      )}
    </div>
  );
}

function EmptyState({ role }: { role: SearchRole }) {
  return (
    <div style={{ padding: "40px 16px", textAlign: "center", color: "#90a4c0" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>
        {role === "passenger" ? "🔍" : "🗺️"}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#5a6a85", marginBottom: 6 }}>
        {role === "passenger"
          ? "Aucun trajet trouvé dans cette zone."
          : "Lance une recherche pour voir les circuits."}
      </p>
      <p style={{ fontSize: 12, lineHeight: 1.5 }}>
        {role === "passenger"
          ? "Élargis le rayon de recherche ou modifie tes critères."
          : "Saisis un départ et une destination, puis clique sur Rechercher."}
      </p>
    </div>
  );
}

function LoadingPlaceholder({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          height: 100,
          background: "linear-gradient(90deg,#f0f4fb 0%,#e5ecf7 50%,#f0f4fb 100%)",
          backgroundSize: "200% 100%",
          borderRadius: 16,
          animation: "shimmer 1.2s linear infinite",
        }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
