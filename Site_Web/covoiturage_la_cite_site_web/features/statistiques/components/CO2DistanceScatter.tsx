"use client";

/**
 * CO2DistanceScatter — nuage de points CO₂ vs distance avec régression linéaire.
 */

import React from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { DataPointCO2Distance } from "../types/statistiques.types";

// ─── Composant ──────────────────────────────────────────────────────────────

const CO2DistanceScatter: React.FC<{ data: DataPointCO2Distance[]; scale: number }> = ({ data, scale }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const catColor: Record<string, string> = { courte: "#e03050", moyenne: "#0aad6a", longue: "#0098c8" };
  const minD = 5, maxD = 35, minCO2 = 0, maxCO2 = 22;
  const W = 260, H = 150;
  const pad = { left: 35, right: 10, top: 10, bottom: 25 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const toX = (d: number) => pad.left + ((d - minD) / (maxD - minD)) * chartW;
  const toY = (c: number) => pad.top + chartH - ((c - minCO2) / (maxCO2 - minCO2)) * chartH;

  // Régression linéaire simple
  const n = data.length;
  const sumX  = data.reduce((a, p) => a + p.distanceKm, 0);
  const sumY  = data.reduce((a, p) => a + p.co2Kg, 0);
  const sumXY = data.reduce((a, p) => a + p.distanceKm * p.co2Kg, 0);
  const sumX2 = data.reduce((a, p) => a + p.distanceKm * p.distanceKm, 0);
  const slope     = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const regY1 = slope * minD + intercept;
  const regY2 = slope * maxD + intercept;

  return (
    <div ref={ref}>
      {/* Conteneur hauteur fixe — la carte ne grandit pas au zoom */}
      <div className="w-full overflow-hidden" style={{ aspectRatio: "260/150" }}>
      <div className="zoom-wrap overflow-auto h-full" style={{ cursor: scale > 1 ? "zoom-out" : "zoom-in" }}>
        <div
          className="px-5 pt-3 pb-2"
          style={{ transformOrigin: "top left", transform: `scale(${scale})`, transition: "transform .3s", width: `${100 / scale}%` }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
            {/* Axes */}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#c8d4ec" strokeWidth={1} />
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#c8d4ec" strokeWidth={1} />
            {/* Grille */}
            {[5, 10, 15, 20].map((v) => (
              <g key={v}>
                <line x1={pad.left} y1={toY(v)} x2={W - pad.right} y2={toY(v)} stroke="#e8eef8" strokeWidth={0.5} />
                <text x={pad.left - 4} y={toY(v) + 3} textAnchor="end" fontSize={6} fill="#7a90b8">{v}</text>
              </g>
            ))}
            {[10, 15, 20, 25, 30].map((v) => (
              <text key={v} x={toX(v)} y={H - pad.bottom + 10} textAnchor="middle" fontSize={6} fill="#7a90b8">{v}</text>
            ))}
            {/* Labels axes */}
            <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={7} fill="#7a90b8">Distance (km)</text>
            <text x={8} y={H / 2} textAnchor="middle" fontSize={7} fill="#7a90b8" transform={`rotate(-90,8,${H / 2})`}>CO₂ (kg)</text>
            {/* Ligne de régression */}
            <line
              x1={toX(minD)} y1={toY(Math.max(0, regY1))}
              x2={toX(maxD)} y2={toY(Math.max(0, regY2))}
              stroke="#08316e" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}
            />
            {/* Points de données */}
            {data.map((p, i) => (
              <circle
                key={i}
                cx={toX(p.distanceKm)} cy={toY(p.co2Kg)} r={4.5}
                fill={catColor[p.categorie]} opacity={0.8}
                style={{
                  transformOrigin: `${toX(p.distanceKm)}px ${toY(p.co2Kg)}px`,
                  transform: isVisible ? "scale(1)" : "scale(0)",
                  transition: `transform 0.4s ease ${0.05 * i}s`,
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-3 mx-5 my-2 text-[10px] text-[#7a90b8] flex-wrap">
        {[
          { c: "#e03050", l: "Court (<15 km)" },
          { c: "#0aad6a", l: "Moyen (15–23 km)" },
          { c: "#0098c8", l: "Long (>23 km)" },
        ].map((s) => (
          <span key={s.l} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.c }} />{s.l}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3.5 h-0 border-t-2 border-dashed border-[#08316e] opacity-50" />Régression
        </span>
      </div>
      </div>
    </div>
  );
};

export default CO2DistanceScatter;
