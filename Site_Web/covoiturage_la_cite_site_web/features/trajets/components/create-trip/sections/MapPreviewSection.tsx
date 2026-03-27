'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FaExpand } from 'react-icons/fa6';
import { MapOverlay } from '../../published-trip/ui/MapOverlay';

// Chargement dynamique sans SSR — Leaflet nécessite window
const LeafletStaticMap = dynamic(
  () => import('../../shared/LeafletStaticMap').then((m) => m.LeafletStaticMap),
  { ssr: false },
);

// MapPreviewSection : Previsualisation du trajet via carte Leaflet réelle
interface MapPreviewSectionProps {
  departureLocation: string;
  arrivalLocation:   string;
  latLngs?:          [number, number][];
  isLoading?:        boolean;
}

export const MapPreviewSection: React.FC<MapPreviewSectionProps> = ({
  departureLocation,
  arrivalLocation,
  latLngs,
  isLoading = false,
}) => {
  // Controle de l'overlay plein écran
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: '#08316e' }}>
            Previsualisation du Trajet
          </h2>

          {/* Bouton plein écran — visible uniquement si une polyline est disponible */}
          {latLngs && latLngs.length >= 2 && (
            <button
              type="button"
              onClick={() => setOverlayOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#08316e' }}
              title="Agrandir la carte"
            >
              <FaExpand size={11} />
              Agrandir
            </button>
          )}
        </div>

        {/* Carte Leaflet avec fond OpenStreetMap et polyline du circuit selectionne */}
        <div className="overflow-hidden rounded-xl relative">
          <LeafletStaticMap
            mode="route"
            latLngs={latLngs ?? []}
            departureLabel={departureLocation}
            arrivalLabel={arrivalLocation}
            height={220}
            interactive={false}
          />
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.7)" }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#08316e]">
                <span className="w-4 h-4 border-2 border-[#08316e] border-t-transparent rounded-full animate-spin" />
                Calcul du trajet...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay plein écran — carte interactive avec polyline complète */}
      <MapOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        mode="route"
        latLngs={latLngs}
        departureLabel={departureLocation}
        arrivalLabel={arrivalLocation}
      />
    </>
  );
};
