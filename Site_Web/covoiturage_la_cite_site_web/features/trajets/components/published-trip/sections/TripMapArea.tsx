'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FaMagnifyingGlass } from 'react-icons/fa6';

// Chargement dynamique sans SSR — Leaflet nécessite window
const LeafletStaticMap = dynamic(
  () => import('../../shared/LeafletStaticMap').then((m) => m.LeafletStaticMap),
  { ssr: false },
);

interface TripMapAreaProps {
  departureLabel: string;
  arrivalLabel: string;
  durationMin: number;
  distanceKm: number;
  latLngs?: [number, number][];
  onMapClick: () => void;
}

/**
 * TripMapArea — zone carte en haut de la page PublishedTripView.
 * Affiche une vraie carte Leaflet statique (sans interactions) avec la polyline du trajet.
 * Un clic ouvre l'overlay carte interactif.
 */
export const TripMapArea: React.FC<TripMapAreaProps> = ({
  departureLabel,
  arrivalLabel,
  durationMin,
  distanceKm,
  latLngs,
  onMapClick,
}) => {
  return (
    <div className="relative w-full" style={{ height: '280px' }}>
      {/* Zone carte Leaflet statique — clic pour ouvrir l'overlay */}
      <div
        className="w-full h-full cursor-pointer overflow-hidden"
        onClick={onMapClick}
        title="Cliquer pour agrandir la carte"
        style={{ pointerEvents: 'none' }}
      >
        <LeafletStaticMap
          mode="route"
          latLngs={latLngs ?? []}
          departureLabel={departureLabel}
          arrivalLabel={arrivalLabel}
          height={280}
          interactive={false}
        />
      </div>

      {/* Overlay cliquable transparent par-dessus la carte pour capturer les clics */}
      <div
        className="absolute inset-0 cursor-pointer z-10"
        onClick={onMapClick}
        title="Cliquer pour agrandir la carte"
        style={{ background: 'transparent' }}
      />

      {/* Badge durée / distance */}
      <div
        className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg z-20"
        style={{ backgroundColor: 'rgba(8,49,110,0.92)' }}
      >
        {durationMin} min · {distanceKm} km
      </div>

      {/* Icône loupe */}
      <div
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors z-20"
        onClick={onMapClick}
        title="Agrandir"
      >
        <FaMagnifyingGlass size={14} color="#08316e" />
      </div>
    </div>
  );
};
