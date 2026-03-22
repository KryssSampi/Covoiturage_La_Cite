'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaXmark } from 'react-icons/fa6';

// Chargement dynamique sans SSR — Leaflet nécessite window
const LeafletStaticMap = dynamic(
  () => import('../../shared/LeafletStaticMap').then((m) => m.LeafletStaticMap),
  { ssr: false },
);

/**
 * Mode d'affichage de l'overlay carte :
 *   'route'     → polyline complète départ → arrivée (carte interactive)
 *   'departure' → carte centrée sur le point de départ uniquement
 *   'arrival'   → carte centrée sur le point d'arrivée uniquement
 */
export type MapOverlayMode = 'route' | 'departure' | 'arrival';

interface MapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Mode d'affichage de la carte */
  mode?: MapOverlayMode;
  // ── Mode 'route' ──
  departureLabel?: string;
  arrivalLabel?: string;
  latLngs?: [number, number][];
  // ── Mode 'departure' / 'arrival' ──
  /** Coordonnées [lat, lng] du point de départ */
  departurePoint?: [number, number];
  /** Coordonnées [lat, lng] du point d'arrivée */
  arrivalPoint?: [number, number];
  departureFullAddress?: string;
  arrivalFullAddress?: string;
}

/**
 * MapOverlay — carte Leaflet plein écran interactive.
 * Supporte trois modes selon ce qui a été cliqué :
 *   - 'route'     : route complète avec polyline
 *   - 'departure' : point de départ seul
 *   - 'arrival'   : point d'arrivée seul
 */
export const MapOverlay: React.FC<MapOverlayProps> = ({
  isOpen,
  onClose,
  mode = 'route',
  departureLabel,
  arrivalLabel,
  latLngs,
  departurePoint,
  arrivalPoint,
  departureFullAddress,
  arrivalFullAddress,
}) => {
  // Fermeture via touche Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Calcul du label de l'en-tête selon le mode ────────────────────────────
  const headerLabel = (() => {
    switch (mode) {
      case 'departure':
        return `Départ · ${departureLabel ?? departureFullAddress ?? ''}`;
      case 'arrival':
        return `Arrivée · ${arrivalLabel ?? arrivalFullAddress ?? ''}`;
      default:
        return `${departureLabel ?? '?'} → ${arrivalLabel ?? '?'}`;
    }
  })();

  // ── Props de la carte selon le mode ──────────────────────────────────────
  const mapNode = (() => {
    switch (mode) {
      case 'departure':
        return (
          <LeafletStaticMap
            mode="point"
            centerPoint={departurePoint}
            pointType="departure"
            pointLabel={departureLabel ?? departureFullAddress}
            height="100%"
            interactive
          />
        );
      case 'arrival':
        return (
          <LeafletStaticMap
            mode="point"
            centerPoint={arrivalPoint}
            pointType="arrival"
            pointLabel={arrivalLabel ?? arrivalFullAddress}
            height="100%"
            interactive
          />
        );
      default:
        return (
          <LeafletStaticMap
            mode="route"
            latLngs={latLngs ?? []}
            departureLabel={departureLabel}
            arrivalLabel={arrivalLabel}
            height="100%"
            interactive
          />
        );
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ height: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <FaXmark size={14} />
        </button>

        {/* Label de l'en-tête selon le mode */}
        <div
          className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow max-w-[70%] truncate"
          style={{ backgroundColor: '#08316e' }}
        >
          {headerLabel}
        </div>

        {/* Carte Leaflet interactive */}
        <div className="w-full h-full">
          {mapNode}
        </div>
      </div>
    </div>
  );
};

