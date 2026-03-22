"use client";

/**
 * @file ListingZone.tsx  (v3)
 * @description Zone de listing — passe les scores aux PassengerTripCard.
 *               Ajoute le bouton « Créer une alerte » (wishing trip) dans l'état vide passager.
 */

import { useState } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { Trip } from "@/features/dashboard/types/trip.types";
import { MapCircuit, SearchRole, MatchingScore } from "@/features/search/types/search.feature.types";
import { RecommendedTripCard } from "./RecommendedTripCard";
import { MapCircuitCard }      from "./MapCircuitCard";
import { FaMagnifyingGlass, FaMapLocationDot, FaBell, FaCheck } from "react-icons/fa6";

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
  /** Déclenché quand le conducteur choisit un circuit pour créer un trajet */
  onChooseCircuit?:  (circuit: MapCircuit) => void;
  onReserveTrip?:    (tripId: number) => void;
  /** Infos pour le bouton wishing trip (EmptyState passager) */
  departureLabel?:   string;
  arrivalLabel?:     string;
  departureCoords?:  [number, number] | null;
  arrivalCoords?:    [number, number] | null;
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
  onChooseCircuit,
  onReserveTrip,
  departureLabel,
  arrivalLabel,
  departureCoords,
  arrivalCoords,
}: ListingZoneProps) {
  if (isLoading) return <LoadingPlaceholder count={role === "driver" ? 3 : 4} />;

  if (role === "passenger") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {trips.length === 0 ? (
          <EmptyState
            role="passenger"
            departureLabel={departureLabel}
            arrivalLabel={arrivalLabel}
            departureCoords={departureCoords}
            arrivalCoords={arrivalCoords}
          />
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
            onChoose={onChooseCircuit}
          />
        ))
      )}
    </div>
  );
}

// ─── État vide ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  role: SearchRole;
  departureLabel?:  string;
  arrivalLabel?:    string;
  departureCoords?: [number, number] | null;
  arrivalCoords?:   [number, number] | null;
}

function EmptyState({ role, departureLabel, arrivalLabel, departureCoords, arrivalCoords }: EmptyStateProps) {
  const [alertCreated, setAlertCreated] = useState(false);
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Crée une alerte wishing trip et la stocke en sessionStorage
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

  // Vérifie si on a assez d'infos pour proposer le wishing trip
  const canCreateAlert = role === "passenger" && departureLabel && arrivalLabel;

  return (
    <div style={{ padding: "40px 16px", textAlign: "center", color: "#90a4c0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {role === "passenger"
          ? <FaMagnifyingGlass size={36} color="#90a4c0" />
          : <FaMapLocationDot size={36} color="#90a4c0" />}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#5a6a85", marginBottom: 6 }}>
        {role === "passenger"
          ? (isFR ? "Aucun trajet trouvé dans cette zone." : "No trip found in this area.")
          : (isFR ? "Lance une recherche pour voir les circuits." : "Start a search to see circuits.")}
      </p>
      <p style={{ fontSize: 12, lineHeight: 1.5, marginBottom: canCreateAlert ? 16 : 0 }}>
        {role === "passenger"
          ? (isFR ? "Élargis le rayon de recherche ou modifie tes critères." : "Expand the search radius or change your criteria.")
          : (isFR ? "Saisis un départ et une destination, puis clique sur Rechercher." : "Enter a departure and destination, then click Search.")}
      </p>

      {/* Bouton wishing trip — passager uniquement, quand départ + arrivée renseignés */}
      {canCreateAlert && !alertCreated && (
        <button
          onClick={handleCreateAlert}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 10,
            background: "#08316e", color: "#fff",
            fontWeight: 600, fontSize: 13,
            border: "none", cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0a4a9e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#08316e")}
        >
          <FaBell size={14} />
          {isFR ? 'Créer une alerte pour ce trajet' : 'Create an alert for this trip'}
        </button>
      )}

      {canCreateAlert && alertCreated && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 10,
          background: "#16a34a", color: "#fff",
          fontWeight: 600, fontSize: 13,
        }}>
          <FaCheck size={14} />
          {isFR ? 'Alerte créée ! Tu seras notifié quand un trajet correspondra.' : 'Alert created! You will be notified when a matching trip is found.'}
        </div>
      )}
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
