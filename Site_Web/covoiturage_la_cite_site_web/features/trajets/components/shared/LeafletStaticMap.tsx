'use client';

/**
 * @file LeafletStaticMap.tsx
 * @description Carte Leaflet réutilisable — supporte deux modes :
 *   - 'route'  : affiche une polyline complète avec marqueurs départ/arrivée
 *   - 'point'  : affiche un seul point (départ ou arrivée) centré sur la carte
 *
 * Ce composant ne doit PAS être importé directement dans les composants Next.js.
 * Il doit être chargé via `dynamic(() => import('./LeafletStaticMap'), { ssr: false })`
 * pour éviter les erreurs SSR liées à Leaflet.
 *
 * @param mode          'route' ou 'point'
 * @param latLngs       Tableau de coordonnées [[lat, lng], ...] pour le mode 'route'
 * @param centerPoint   Coordonnée [lat, lng] pour le mode 'point'
 * @param pointType     'departure' | 'arrival' — détermine l'icône affichée en mode 'point'
 * @param pointLabel    Label affiché dans le popup du marqueur (mode 'point')
 * @param departureLabel  Label du départ (mode 'route')
 * @param arrivalLabel    Label de l'arrivée (mode 'route')
 * @param height        Hauteur CSS du conteneur
 * @param interactive   Si false (défaut), désactive zoom/pan/scroll
 */

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMap } from 'react-icons/fa6';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LeafletStaticMapProps {
  /** Mode d'affichage de la carte */
  mode: 'route' | 'point';

  // — Mode 'route' —
  /** Polyline du trajet au format [[lat, lng], ...] */
  latLngs?: [number, number][];
  /** Label court du départ — affiché dans le marqueur */
  departureLabel?: string;
  /** Label court de l'arrivée — affiché dans le marqueur */
  arrivalLabel?: string;

  // — Mode 'point' —
  /** Coordonnée [lat, lng] du point unique à centrer */
  centerPoint?: [number, number];
  /** Type du point affiché : départ (vert) ou arrivée (rouge) */
  pointType?: 'departure' | 'arrival';
  /** Label du popup du marqueur */
  pointLabel?: string;

  /** Hauteur CSS du conteneur (défaut : 200px) */
  height?: number | string;
  /** Si true → carte interactive (zoom/pan) ; si false → tout verrouillé */
  interactive?: boolean;
}

// ─── Icônes DivIcon personnalisées ────────────────────────────────────────────

/** Marqueur circulaire vert — point de départ */
const ICON_DEPARTURE = L.divIcon({
  className: '',
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#16a34a;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(22,163,74,0.55);
    display:flex;align-items:center;justify-content:center;
  "><span style="color:#fff;font-size:11px;font-weight:700;line-height:1;">A</span></div>`,
  iconSize:    [24, 24],
  iconAnchor:  [12, 24],
  popupAnchor: [0, -26],
});

/** Marqueur drapeau rouge — point d'arrivée */
const ICON_ARRIVAL = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:30px;">
    <div style="position:absolute;left:3px;top:0;bottom:0;width:3px;background:#dc2626;border-radius:2px;"></div>
    <div style="position:absolute;left:6px;top:1px;width:15px;height:11px;background:#dc2626;clip-path:polygon(0 0,100% 30%,0 60%);border-radius:1px;"></div>
    <div style="position:absolute;left:1px;bottom:0;width:8px;height:3px;border-radius:3px;background:#dc2626;opacity:0.35;"></div>
  </div>`,
  iconSize:    [22, 30],
  iconAnchor:  [3, 30],
  popupAnchor: [6, -30],
});

// ─── Composant interne : recadre la carte sur les données ─────────────────────

/**
 * FitBounds — au montage, ajuste automatiquement le viewport sur les données.
 * Utilise une ref pour éviter le re-zoom lors des re-renders.
 */
function FitBounds({
  latLngs,
  centerPoint,
}: {
  latLngs?: [number, number][];
  centerPoint?: [number, number];
}) {
  const map = useMap();
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    if (centerPoint) {
      // Centrer sur un point unique avec un zoom approprié
      map.setView(centerPoint, 15);
    } else if (latLngs && latLngs.length >= 2) {
      // Englober toute la polyline avec padding
      const bounds = L.latLngBounds(latLngs.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [map, latLngs, centerPoint]);

  return null;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export const LeafletStaticMap: React.FC<LeafletStaticMapProps> = ({
  mode,
  latLngs,
  departureLabel,
  arrivalLabel,
  centerPoint,
  pointType = 'departure',
  pointLabel,
  height = 200,
  interactive = false,
}) => {
  // ── Placeholder si données insuffisantes ───────────────────────────────────
  const hasRouteData = mode === 'route' && latLngs && latLngs.length >= 2;
  const hasPointData = mode === 'point' && centerPoint;

  if (!hasRouteData && !hasPointData) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ddeef8',
          borderRadius: 12,
          gap: 6,
        }}
      >
        <FaMap size={28} color="#08316e88" />
        <span style={{ fontSize: 12, color: '#5a7a9a' }}>
          {mode === 'route'
            ? 'Saisir un départ et une arrivée pour afficher la carte'
            : 'Coordonnées non disponibles'}
        </span>
      </div>
    );
  }

  // ── Centre initial de la carte ─────────────────────────────────────────────
  // Utiliser le centre de la polyline ou le point unique comme centre initial
  const initialCenter: [number, number] = centerPoint
    ?? (latLngs && latLngs.length > 0
        ? latLngs[Math.floor(latLngs.length / 2)]
        : [45.4215, -75.6972]); // Ottawa par défaut

  // ── Options Leaflet selon le mode interactif ──────────────────────────────
  const mapProps = interactive
    ? {}
    : {
        dragging:         false,
        zoomControl:      false,
        scrollWheelZoom:  false,
        touchZoom:        false,
        doubleClickZoom:  false,
        keyboard:         false,
        boxZoom:          false,
        attributionControl: false,
      };

  return (
    <MapContainer
      center={initialCenter}
      zoom={13}
      style={{ height, width: '100%' }}
      {...mapProps}
    >
      {/* Tuiles OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      {/* Ajustement automatique du viewport */}
      <FitBounds latLngs={latLngs} centerPoint={centerPoint} />

      {/* ── Mode ROUTE : polyline + marqueurs départ/arrivée ─────────────── */}
      {mode === 'route' && latLngs && latLngs.length >= 2 && (
        <>
          {/* Ombre portée de la polyline */}
          <Polyline
            positions={latLngs}
            pathOptions={{ color: '#08316e', weight: 6, opacity: 0.18 }}
          />
          {/* Polyline principale bleue */}
          <Polyline
            positions={latLngs}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
          />

          {/* Marqueur départ (vert) */}
          <Marker position={latLngs[0]} icon={ICON_DEPARTURE}>
            {departureLabel && (
              <Popup>
                <strong>{departureLabel}</strong>
              </Popup>
            )}
          </Marker>

          {/* Marqueur arrivée (rouge) */}
          <Marker position={latLngs[latLngs.length - 1]} icon={ICON_ARRIVAL}>
            {arrivalLabel && (
              <Popup>
                <strong>{arrivalLabel}</strong>
              </Popup>
            )}
          </Marker>
        </>
      )}

      {/* ── Mode POINT : un seul marqueur centré ─────────────────────────── */}
      {mode === 'point' && centerPoint && (
        <Marker
          position={centerPoint}
          icon={pointType === 'departure' ? ICON_DEPARTURE : ICON_ARRIVAL}
        >
          {pointLabel && (
            <Popup>
              <strong>{pointLabel}</strong>
            </Popup>
          )}
        </Marker>
      )}
    </MapContainer>
  );
};

export default LeafletStaticMap;
