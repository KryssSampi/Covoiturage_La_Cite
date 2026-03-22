'use client';

import React from 'react';
import { FaMap } from 'react-icons/fa6';

/**
 * @file StaticPolylineMap.tsx
 * @description Carte statique SVG avec polyline, marqueur de départ (point bleu)
 * et marqueur d'arrivée (drapeau rouge). Aucune dépendance externe.
 *
 * @param latLngs  Tableau de coordonnées au format [lat, lng] (convention Leaflet / OSRM décodé).
 *                 Si le format est [lng, lat], permuter les indices dans computePoints.
 * @param height   Hauteur en pixels du conteneur (défaut : 200).
 */

interface StaticPolylineMapProps {
  /** Points de la polyline au format [[lat, lng], ...] */
  latLngs: [number, number][];
  departureLabel?: string;
  arrivalLabel?: string;
  /** Hauteur CSS en pixels */
  height?: number | string;
}

// ─── Projection Mercator sur un viewport SVG ──────────────────────────────────

/** Convertit une latitude en valeur Mercator (pour la projection Y SVG) */
function toMercY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

/**
 * Projette les latLngs vers des coordonnées pixel dans l'espace SVG donné.
 * Applique un padding pour laisser de la place aux marqueurs et labels.
 */
function projectPoints(
  latLngs: [number, number][],
  svgW: number,
  svgH: number,
  pad: number,
): { x: number; y: number }[] {
  const lngs  = latLngs.map(([, lng]) => lng);
  const mercYs = latLngs.map(([lat]) => toMercY(lat));

  const minLng  = Math.min(...lngs),  maxLng  = Math.max(...lngs);
  const minMerc = Math.min(...mercYs), maxMerc = Math.max(...mercYs);

  const rangeLng  = maxLng  - minLng  || 0.001;
  const rangeMerc = maxMerc - minMerc || 0.001;

  const drawW = svgW - 2 * pad;
  const drawH = svgH - 2 * pad;

  return latLngs.map(([, lng], i) => ({
    x: pad + ((lng - minLng) / rangeLng) * drawW,
    // Y inversé : lat haute → pixelY bas (nord en haut)
    y: pad + (1 - (mercYs[i] - minMerc) / rangeMerc) * drawH,
  }));
}

// ─── Composant ────────────────────────────────────────────────────────────────

export const StaticPolylineMap: React.FC<StaticPolylineMapProps> = ({
  latLngs,
  departureLabel,
  arrivalLabel,
  height = 200,
}) => {
  // Placeholder si aucun tracé disponible
  if (!latLngs || latLngs.length < 2) {
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
          Saisir un départ et une arrivée pour afficher la carte
        </span>
      </div>
    );
  }

  const SVG_W = 600;
  const SVG_H = 300;
  const PAD   = 40;

  const points    = projectPoints(latLngs, SVG_W, SVG_H, PAD);
  const departure = points[0];
  const arrival   = points[points.length - 1];

  // Construire le chemin SVG de la polyline
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  // Tronquer les labels pour éviter le débordement dans le SVG
  const truncate = (s: string, max = 22) =>
    s.length > max ? s.slice(0, max) + '…' : s;

  // Positionner le label de départ : à droite si le point est plutôt à gauche
  const depLabelX = departure.x < SVG_W / 2
    ? Math.min(departure.x + 16, SVG_W - 10)
    : Math.max(departure.x - 16, 10);
  const depAnchor = departure.x < SVG_W / 2 ? 'start' : 'end';

  // Positionner le label d'arrivée : à gauche si le point est plutôt à droite
  const arrLabelX = arrival.x > SVG_W / 2
    ? Math.max(arrival.x - 16, 10)
    : Math.min(arrival.x + 16, SVG_W - 10);
  const arrAnchor = arrival.x > SVG_W / 2 ? 'end' : 'start';

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
        aria-label={`Carte du trajet${departureLabel ? ` de ${departureLabel}` : ''}${arrivalLabel ? ` vers ${arrivalLabel}` : ''}`}
      >
        <defs>
          {/* Fond dégradé carte */}
          <linearGradient id="spmap-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#e8f4fd" />
            <stop offset="100%" stopColor="#d0e8f5" />
          </linearGradient>
          {/* Ombre douce pour la polyline */}
          <filter id="spmap-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#08316e" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* ── Fond ── */}
        <rect width={SVG_W} height={SVG_H} fill="url(#spmap-bg)" />

        {/* ── Grille légère (fond cartographique) ── */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}    y1={(SVG_H / 9) * i}
            x2={SVG_W} y2={(SVG_H / 9) * i}
            stroke="#b5d0e8" strokeWidth={0.6} strokeDasharray="4 6"
          />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={(SVG_W / 13) * i} y1={0}
            x2={(SVG_W / 13) * i} y2={SVG_H}
            stroke="#b5d0e8" strokeWidth={0.6} strokeDasharray="4 6"
          />
        ))}

        {/* ── Polyline halo (ombre) ── */}
        <path
          d={pathD}
          fill="none"
          stroke="#08316e"
          strokeOpacity={0.2}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Polyline principale ── */}
        <path
          d={pathD}
          fill="none"
          stroke="#08316e"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#spmap-shadow)"
        />

        {/* ── Marqueur départ : cercle bleu avec point blanc ── */}
        <circle cx={departure.x} cy={departure.y} r={12} fill="#08316e" stroke="white" strokeWidth={2.5} />
        <circle cx={departure.x} cy={departure.y} r={5}  fill="white" />

        {/* ── Marqueur arrivée : drapeau rouge ── */}
        {/* Pied du mât */}
        <circle cx={arrival.x} cy={arrival.y} r={5} fill="#e04a2f" stroke="white" strokeWidth={2} />
        {/* Mât */}
        <line
          x1={arrival.x} y1={arrival.y - 2}
          x2={arrival.x} y2={arrival.y - 24}
          stroke="#e04a2f" strokeWidth={2.5} strokeLinecap="round"
        />
        {/* Drapeau */}
        <polygon
          points={`${arrival.x},${arrival.y - 24} ${arrival.x + 14},${arrival.y - 17} ${arrival.x},${arrival.y - 10}`}
          fill="#e04a2f"
        />

        {/* ── Label départ ── */}
        {departureLabel && (
          <text
            x={depLabelX}
            y={departure.y - 16}
            fontSize={11}
            fontWeight="700"
            fill="#08316e"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor={depAnchor}
          >
            {truncate(departureLabel)}
          </text>
        )}

        {/* ── Label arrivée ── */}
        {arrivalLabel && (
          <text
            x={arrLabelX}
            y={arrival.y - 30}
            fontSize={11}
            fontWeight="700"
            fill="#e04a2f"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor={arrAnchor}
          >
            {truncate(arrivalLabel)}
          </text>
        )}
      </svg>
    </div>
  );
};
