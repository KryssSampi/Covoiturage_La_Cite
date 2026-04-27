/* eslint-disable-file */
"use client";

import dynamic from "next/dynamic";
import { MapCircuit, SearchFilters, SearchRole } from "@/features/search/types/search.feature.types";
import type { LieuFavoriUnifie } from "@/shared/types/lieu-favori.types";

// MapView charge en client-only (Leaflet)
const MapView = dynamic(() => import("../MapView").then((m) => m.MapView), { ssr: false });

interface MapContainerProps {
  role: SearchRole;
  isLoading: boolean;
  isFR: boolean;
  mapDeparture: [number, number] | null;
  mapArrival: [number, number] | null;
  mapDepLabel: string;
  mapArrLabel: string;
  mapTripDeparture: [number, number] | null;
  mapTripArrival: [number, number] | null;
  mapTripDepLabel: string;
  mapTripArrLabel: string;
  mapRoute: [number, number][];
  mapCircuits: MapCircuit[];
  activeCircuitIdx: number;
  filters: SearchFilters;
  favorites?: LieuFavoriUnifie[];
}

export function MapContainer({
  role,
  isLoading,
  isFR,
  mapDeparture,
  mapArrival,
  mapDepLabel,
  mapArrLabel,
  mapTripDeparture,
  mapTripArrival,
  mapTripDepLabel,
  mapTripArrLabel,
  mapRoute,
  mapCircuits,
  activeCircuitIdx,
  filters,
  favorites = [],
}: MapContainerProps) {
  return (
    <div style={{ flex: 1, minWidth: 280, maxHeight: "60vh", position: "relative" }}>
      <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #d0d8e8", boxShadow: "0 2px 12px rgba(8,49,110,0.1)" }}>
        {/* A/B = coords de la recherche (stables, ne bougent pas). Trip = coords du trajet cliqué (vert/rouge) */}
        <MapView
          isFR={isFR}
          departure={mapDeparture ? [mapDeparture[1], mapDeparture[0]] : null}
          departureLabel={mapDepLabel}
          arrival={mapArrival ? [mapArrival[1], mapArrival[0]] : null}
          arrivalLabel={mapArrLabel}
          tripDeparture={mapTripDeparture ? [mapTripDeparture[1], mapTripDeparture[0]] : null}
          tripDepartureLabel={mapTripDepLabel}
          tripArrival={mapTripArrival ? [mapTripArrival[1], mapTripArrival[0]] : null}
          tripArrivalLabel={mapTripArrLabel}
          routeLatLngs={mapRoute}
          circuits={mapCircuits}
          activeCircuitIndex={activeCircuitIdx}
          showRadiusCircles={role === "passenger"}
          departureRadiusMeters={filters.departureRadiusMeters}
          arrivalRadiusMeters={filters.arrivalRadiusMeters}
          favorites={favorites}
          height="60vh"
        />
      </div>

      {/* Overlay de chargement — blur la carte pendant que les résultats sont en cours */}
      {isLoading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          borderRadius: 16,
          background: "rgba(245,248,255,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            border: "3.5px solid rgba(8,49,110,0.12)",
            borderTop: "3.5px solid #08316e",
            animation: "ms-search-spin .8s linear infinite",
          }} />
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#08316e",
            fontFamily: "'Syne', sans-serif",
          }}>
            {role === "driver" ? (isFR ? "Recherche de circuits…" : "Searching circuits…") : (isFR ? "Recherche de trajets…" : "Searching trips…")}
          </span>
          <style>{`@keyframes ms-search-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}
    </div>
  );
}
