'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMap } from 'react-icons/fa6';
import { FIXTURE_LIEUX_FAVORIS } from '@/shared/fixtures/favoris.fixtures';
import type { LieuFavoriUnifie } from '@/shared/types/lieu-favori.types';
import {
  TILE_CONFIGS,
  injectMapServiceCSS,
  addCampusLayer,
  addOverpassLayer,
  addFavoritesLayer,
} from '@/features/map-service';

export interface LeafletStaticMapProps {
  mode: 'route' | 'point';

  latLngs?: [number, number][];
  departureLabel?: string;
  arrivalLabel?: string;

  centerPoint?: [number, number];
  pointType?: 'departure' | 'arrival';
  pointLabel?: string;

  height?: number | string;
  interactive?: boolean;
}

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
      map.setView(centerPoint, 15);
    } else if (latLngs && latLngs.length >= 2) {
      const bounds = L.latLngBounds(latLngs.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [map, latLngs, centerPoint]);

  return null;
}

function MapServiceLayers({ isFR, favorites }: { isFR: boolean; favorites: LieuFavoriUnifie[] }) {
  const map = useMap();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const mapAny = map as unknown as { _msOverlays?: boolean };
    if (mapAny._msOverlays) return;
    // eslint-disable-next-line react-hooks/immutability
    mapAny._msOverlays = true;

    injectMapServiceCSS();

    void (async () => {
      await addCampusLayer(map, L, { showPerimeter: true, showZones: true, showBusStopZone: false });
      await addOverpassLayer(map, L, { showBusStops: false, showGasStations: true, showPublicServices: true });
      await addFavoritesLayer(map, L, favorites, { isFR });
    })();
  }, [map, isFR, favorites]);

  return null;
}

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

  const initialCenter: [number, number] = centerPoint
    ?? (latLngs && latLngs.length > 0
        ? latLngs[Math.floor(latLngs.length / 2)]
        : [45.4215, -75.6972]);

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
      <TileLayer
        url={TILE_CONFIGS['carto-voyager'].url}
        attribution={TILE_CONFIGS['carto-voyager'].attribution}
        subdomains={TILE_CONFIGS['carto-voyager'].subdomains ?? 'abc'}
        maxZoom={TILE_CONFIGS['carto-voyager'].maxZoom}
      />

      <FitBounds latLngs={latLngs} centerPoint={centerPoint} />
      <MapServiceLayers isFR favorites={FIXTURE_LIEUX_FAVORIS} />

      {mode === 'route' && latLngs && latLngs.length >= 2 && (
        <>
          <Polyline
            positions={latLngs}
            pathOptions={{ color: '#08316e', weight: 6, opacity: 0.18 }}
          />
          <Polyline
            positions={latLngs}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
          />

          <Marker position={latLngs[0]} icon={ICON_DEPARTURE}>
            {departureLabel && (
              <Popup>
                <strong>{departureLabel}</strong>
              </Popup>
            )}
          </Marker>

          <Marker position={latLngs[latLngs.length - 1]} icon={ICON_ARRIVAL}>
            {arrivalLabel && (
              <Popup>
                <strong>{arrivalLabel}</strong>
              </Popup>
            )}
          </Marker>
        </>
      )}

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

