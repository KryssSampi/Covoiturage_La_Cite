'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { FaLocationDot, FaFlag } from 'react-icons/fa6';
import { TripPoint } from '../../../types/published-trip.view.types';

// Chargement dynamique sans SSR — Leaflet nécessite window
const LeafletStaticMap = dynamic(
  () => import('../../shared/LeafletStaticMap').then((m) => m.LeafletStaticMap),
  { ssr: false },
);

interface TripPointSectionProps {
  type: 'departure' | 'arrival';
  point: TripPoint;
  /** Callback déclenché au clic sur la mini-carte — ouvre l'overlay dans le bon mode */
  onMapClick?: () => void;
}

export const TripPointSection: React.FC<TripPointSectionProps> = ({ type, point, onMapClick }) => {
  const title = type === 'departure' ? 'Départ' : 'Arrivée';
  // Le point dispose-t-il de coordonnées pour afficher la mini-carte ?
  const hasCoords = typeof point.lat === 'number' && typeof point.lng === 'number';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-bold mb-2" style={{ color: '#08316e' }}>
        {title}
      </h3>
      <div className="flex gap-3">

        {/* Aperçu — mini-carte Leaflet si coordonnées disponibles, sinon icône */}
        <div
          className="w-16 h-14 rounded-lg shrink-0 overflow-hidden"
          style={{ cursor: hasCoords ? 'pointer' : 'default', position: 'relative' }}
          onClick={hasCoords ? onMapClick : undefined}
          title={hasCoords ? 'Voir sur la carte' : undefined}
        >
          {hasCoords ? (
            <>
              {/* Mini-carte Leaflet centrée sur le point */}
              <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                <LeafletStaticMap
                  mode="point"
                  centerPoint={[point.lat!, point.lng!]}
                  pointType={type}
                  pointLabel={point.label}
                  height={56}
                  interactive={false}
                />
              </div>
              {/* Overlay transparent pour capturer le clic sans interférer avec Leaflet */}
              <div
                className="absolute inset-0 z-10"
                style={{ background: 'transparent' }}
              />
            </>
          ) : point.mapPreviewUrl ? (
            // Fallback image statique si disponible
            <div className="w-full h-full bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={point.mapPreviewUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            // Fallback icône si aucune donnée de carte
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: '#e8edf2' }}
            >
              {type === 'departure'
                ? <FaLocationDot size={22} color="#16a34a" />
                : <FaFlag size={20} color="#e04a2f" />
              }
            </div>
          )}
        </div>

        {/* Adresse + instructions */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate" title={point.fullAddress}>
            {point.fullAddress}
          </p>
          {point.instructions && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {point.instructions}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

