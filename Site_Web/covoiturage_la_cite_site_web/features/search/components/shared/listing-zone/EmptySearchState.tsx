"use client";

import { useState } from "react";
import { FaMagnifyingGlass, FaMapLocationDot, FaBell, FaCheck } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import { SearchRole } from "@/features/search/types/search.feature.types";

interface EmptySearchStateProps {
  role: SearchRole;
  departureLabel?: string;
  arrivalLabel?: string;
  departureCoords?: [number, number] | null;
  arrivalCoords?: [number, number] | null;
  compact?: boolean;
}

export function EmptySearchState({
  role,
  departureLabel,
  arrivalLabel,
  departureCoords,
  arrivalCoords,
  compact = false,
}: EmptySearchStateProps) {
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
