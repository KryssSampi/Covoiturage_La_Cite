/* eslint-disable-file */
"use client";

import { ListingZone } from "../ListingZone";
import { FaArrowsRotate } from "react-icons/fa6";
import type { Trip } from "@/features/dashboard/types/trip.types";
import type { MatchingScore, MapCircuit, SearchRole, TripWithCoords } from "@/features/search/types/search.feature.types";

interface WaypointListProps {
  role: SearchRole;
  isFR: boolean;
  filteredTrips: Trip[];
  totalCount: number;
  sortedCircuits: MapCircuit[];
  blockedTrips: TripWithCoords[];
  activeCircuitIdx: number;
  isLoading: boolean;
  scores: Map<string, MatchingScore>;
  serverScores?: Map<string, number>;
  selectedTripId: string | null;
  onSelectTrip: (trip: Trip) => void;
  onSelectCircuit: (idx: number) => void;
  onPublishCircuit?: (circuit: MapCircuit) => void;
  onChooseCircuit: (circuit: MapCircuit) => void;
  /** Carte tripId → statut de réservation active du passager connecté */
  userReservations?: Map<string, string>;
  departureLabel: string;
  arrivalLabel: string;
  departureCoords: [number, number] | null;
  arrivalCoords: [number, number] | null;
  departureRadiusMeters: number;
  arrivalRadiusMeters: number;
  /** Callback pour rafraîchir les résultats passager */
  onRefresh?: () => void;
}

export function WaypointList({
  role,
  isFR,
  filteredTrips,
  totalCount,
  sortedCircuits,
  blockedTrips,
  activeCircuitIdx,
  isLoading,
  scores,
  serverScores,
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
  onRefresh,
}: WaypointListProps) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #d0d8e8", padding: "20px 16px", boxShadow: "0 1px 6px rgba(8,49,110,0.06)", maxHeight: "40vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#08316e" }}>
          {role === "passenger"
            ? (isFR ? `${filteredTrips.length} trajet${filteredTrips.length !== 1 ? "s" : ""} disponible${filteredTrips.length !== 1 ? "s" : ""}` : `${filteredTrips.length} available trip${filteredTrips.length !== 1 ? "s" : ""}`)
            : (isFR ? `${sortedCircuits.length} circuit${sortedCircuits.length !== 1 ? "s" : ""} trouvé${sortedCircuits.length !== 1 ? "s" : ""}` : `${sortedCircuits.length} circuit${sortedCircuits.length !== 1 ? "s" : ""} found`)}
        </h2>
        {role === "passenger" && onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label={isFR ? "Actualiser" : "Refresh"}
            title={isFR ? "Actualiser les résultats" : "Refresh results"}
            style={{
              background: "none", border: "none", cursor: isLoading ? "not-allowed" : "pointer",
              color: "#08316e", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", gap: 4,
              opacity: isLoading ? 0.4 : 1, transition: "opacity 0.2s",
            }}
          >
            <FaArrowsRotate style={{ fontSize: 16, animation: isLoading ? "spin 1s linear infinite" : "none" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{isFR ? "Actualiser" : "Refresh"}</span>
          </button>
        )}
      </div>
      <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 4 }}>
        <ListingZone
          role={role}
          trips={role === "passenger" ? filteredTrips : undefined}
          blockedTrips={role === "passenger" ? blockedTrips : undefined}
          circuits={role === "driver" ? sortedCircuits : undefined}
          activeCircuitIdx={activeCircuitIdx}
          isLoading={isLoading}
          scores={scores}
          serverScores={serverScores}
          selectedTripId={selectedTripId}
          onSelectTrip={onSelectTrip}
          onSelectCircuit={onSelectCircuit}
          onPublishCircuit={onPublishCircuit}
          onChooseCircuit={onChooseCircuit}
          userReservations={userReservations}
          departureLabel={departureLabel}
          arrivalLabel={arrivalLabel}
          departureCoords={departureCoords}
          arrivalCoords={arrivalCoords}
          departureRadiusMeters={departureRadiusMeters}
          arrivalRadiusMeters={arrivalRadiusMeters}
        />
      </div>
    </div>
  );
}
