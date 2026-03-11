"use client";

/**
 * @file MapView.tsx
 * @description Carte Leaflet principale du feature Search.
 *
 * Supporte deux modes :
 *   - Mode passager : tracé de la route + cercles bleus sur départ/arrivée
 *   - Mode conducteur : tracé de plusieurs circuits (multi-polylines)
 *
 * IMPORTANT : Le CSS Leaflet est importé dans globals.css, PAS ici.
 */

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapCircuit } from "@/features/search/types/search.feature.types";

// Création d'une icône DivIcon lettrée (A ou B)
function createLabelIcon(label: "A" | "B") {
  return L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;border-radius:50%;background:#08316e;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(8,49,110,0.35);">${label}</div>`,
    iconSize:    [32, 32],
    iconAnchor:  [16, 32],
    popupAnchor: [0, -32],
  });
}

const ICON_A = createLabelIcon("A");
const ICON_B = createLabelIcon("B");

// Icône cercle vert — point de départ du trajet sélectionné
const ICON_TRIP_START = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:0 2px 10px rgba(22,163,74,0.55);"></div>`,
  iconSize:    [22, 22],
  iconAnchor:  [11, 22],
  popupAnchor: [0, -22],
});

// Icône drapeau rouge — point d'arrivée du trajet sélectionné
const ICON_TRIP_END = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:22px;height:28px;"><div style="position:absolute;left:4px;top:0;bottom:0;width:2.5px;background:#dc2626;border-radius:2px;"></div><div style="position:absolute;left:6.5px;top:1px;width:14px;height:10px;background:#dc2626;clip-path:polygon(0 0,100% 30%,0 60%);"></div></div>`,
  iconSize:    [22, 28],
  iconAnchor:  [4, 28],
  popupAnchor: [4, -28],
});

// Ajuste le zoom pour englober toutes les polylines visibles
function FitBoundsMulti({ allLatLngs }: { allLatLngs: [number, number][][] }) {
  const map = useMap();
  // Comparaison par valeur (pas par référence) pour éviter les re-zooms
  // déclenchés par les interactions utilisateur (zoom, pan, re-renders)
  const serializedRef = useRef<string>("");

  useEffect(() => {
    const serialized = JSON.stringify(allLatLngs);
    if (serialized === serializedRef.current) return; // données inchangées — ne pas re-zoomer
    serializedRef.current = serialized;

    const flat = allLatLngs.flat();
    if (flat.length < 2) return;
    const bounds = L.latLngBounds(flat.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [allLatLngs, map]);
  return null;
}

export interface MapViewProps {
  /** Coordonnées du départ de la RECHERCHE [lat, lng] — marqueur A + cercle bleu */
  departure: [number, number] | null;
  departureLabel: string;
  /** Coordonnées de l'arrivée de la RECHERCHE [lat, lng] — marqueur B + cercle bleu */
  arrival: [number, number] | null;
  arrivalLabel: string;
  /** Départ du TRAJET sélectionné [lat, lng] — cercle vert */
  tripDeparture?: [number, number] | null;
  tripDepartureLabel?: string;
  /** Arrivée du TRAJET sélectionné [lat, lng] — drapeau rouge */
  tripArrival?: [number, number] | null;
  tripArrivalLabel?: string;
  /** Polyline de la route principale (mode passager / route unique) */
  routeLatLngs?: [number, number][];
  /** Circuits OSRM alternatifs (mode conducteur) */
  circuits?: MapCircuit[];
  /** Index du circuit actif mis en évidence */
  activeCircuitIndex?: number;
  /** Affiche des cercles de proximité autour des marqueurs (passager) */
  showRadiusCircles?: boolean;
  /** Rayon du cercle départ (mètres) */
  departureRadiusMeters?: number;
  /** Rayon du cercle arrivée (mètres) */
  arrivalRadiusMeters?: number;
  /** Hauteur CSS explicite */
  height?: string;
}

/**
 * MapView — carte Leaflet unifiée passager/conducteur.
 */
export function MapView({
  departure,
  departureLabel,
  arrival,
  arrivalLabel,
  tripDeparture          = null,
  tripDepartureLabel     = "",
  tripArrival            = null,
  tripArrivalLabel       = "",
  routeLatLngs           = [],
  circuits               = [],
  activeCircuitIndex     = 0,
  showRadiusCircles      = false,
  departureRadiusMeters  = 300,
  arrivalRadiusMeters    = 300,
  height                 = "480px",
}: MapViewProps) {
  const center: [number, number] = [45.4189, -75.6720]; // Campus La Cité

  const allPolylines: [number, number][][] =
    circuits.length > 0
      ? circuits.map((c) => c.latLngs)
      : routeLatLngs.length > 0
        ? [routeLatLngs]
        : [];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height, width: "100%", borderRadius: 12, position: "relative" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {departure && (
        <Marker position={departure} icon={ICON_A}>
          <Popup>{departureLabel || "Départ"}</Popup>
        </Marker>
      )}

      {arrival && (
        <Marker position={arrival} icon={ICON_B}>
          <Popup>{arrivalLabel || "Arrivée"}</Popup>
        </Marker>
      )}

      {showRadiusCircles && departure && (
        <Circle
          center={departure}
          radius={departureRadiusMeters}
          pathOptions={{ color: "#08316e", fillColor: "#08316e", fillOpacity: 0.08, weight: 1.5, dashArray: "6,4" }}
        />
      )}
      {showRadiusCircles && arrival && (
        <Circle
          center={arrival}
          radius={arrivalRadiusMeters}
          pathOptions={{ color: "#08316e", fillColor: "#08316e", fillOpacity: 0.08, weight: 1.5, dashArray: "6,4" }}
        />
      )}

      {/* Marqueurs du trajet sélectionné : cercle vert (départ) + drapeau rouge (arrivée) */}
      {tripDeparture && (
        <Marker position={tripDeparture} icon={ICON_TRIP_START}>
          <Popup>{tripDepartureLabel || "Départ du trajet"}</Popup>
        </Marker>
      )}
      {tripArrival && (
        <Marker position={tripArrival} icon={ICON_TRIP_END}>
          <Popup>{tripArrivalLabel || "Arrivée du trajet"}</Popup>
        </Marker>
      )}

      {circuits.length > 0 &&
        circuits.map((circuit, idx) => {
          const isActive = idx === activeCircuitIndex;
          return (
            <Polyline
              key={`circuit-${circuit.routeIndex}`}
              positions={circuit.latLngs}
              pathOptions={{
                color:   isActive ? "#08316e" : "#90a4c0",
                weight:  isActive ? 5 : 2.5,
                opacity: isActive ? 0.9 : 0.55,
              }}
            />
          );
        })}

      {circuits.length === 0 && routeLatLngs.length > 1 && (
        <Polyline
          positions={routeLatLngs}
          pathOptions={{ color: "#08316e", weight: 5, opacity: 0.85 }}
        />
      )}

      {allPolylines.length > 0 && <FitBoundsMulti allLatLngs={allPolylines} />}
    </MapContainer>
  );
}
