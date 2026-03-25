"use client";

/**
 * ScatterProgression — graphique scatter de la progression du GoScore.
 * Les données sont dérivées des GoEvents réels de l'utilisateur.
 */

import React, { useMemo } from "react";
import { FaRocket } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import TrendMsg from "./ui/TrendMsg";
import type { GoEvent } from "@/features/goboard/types/goboard.types";

// ─── Constantes SVG ──────────────────────────────────────────────────────────

const X_START = 52;
const X_END   = 505;
const Y_TOP   = 22;
const Y_BOT   = 178;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

type EventType = "gain" | "loss" | "badge";

function classifyEvent(e: GoEvent): EventType {
  if (e.points < 0) return "loss";
  if (e.titre.toLowerCase().includes("badge")) return "badge";
  return "gain";
}

const TYPE_COLOR: Record<EventType, string> = {
  gain:  "#0aad6a",
  loss:  "#e03050",
  badge: "#c8960a",
};

// ─── Composant ──────────────────────────────────────────────────────────────

interface ScatterProgressionProps {
  scale: number;
  goEvents: GoEvent[];
  currentScore: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

function ScatterProgression({ scale, goEvents, currentScore, containerRef }: ScatterProgressionProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  const chart = useMemo(() => {
    if (!goEvents.length) return null;

    // 1. Tri chronologique ascendant
    const sorted = [...goEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // 2. Score de départ = score actuel − somme de tous les deltas
    const totalPts = sorted.reduce((s, e) => s + e.points, 0);
    const baseScore = Math.max(0, currentScore - totalPts);

    // 3. Points cumulatifs (reduce pour éviter mutation de variable)
    const raw = sorted.reduce<{ ts: number; score: number; delta: number; type: EventType }[]>(
      (acc, e) => {
        const prev = acc.length ? acc[acc.length - 1].score : baseScore;
        return [
          ...acc,
          {
            ts:    new Date(e.date).getTime(),
            score: prev + e.points,
            delta: e.points,
            type:  classifyEvent(e),
          },
        ];
      },
      [],
    );

    // 4. Plage Y avec marges
    const allScores = [baseScore, ...raw.map((p) => p.score)];
    const rawMin = Math.min(...allScores);
    const rawMax = Math.max(...allScores);
    const pad  = Math.max((rawMax - rawMin) * 0.18, 30);
    const yMin = Math.floor((rawMin - pad) / 10) * 10;
    const yMax = Math.ceil((rawMax + pad)  / 10) * 10;

    // 5. Plage X
    const tMin = raw[0].ts;
    const tMax = raw[raw.length - 1].ts;
    const tRange = Math.max(tMax - tMin, 1);

    const scoreToY = (s: number) => lerp(Y_BOT, Y_TOP, (s - yMin) / (yMax - yMin));
    const tsToX    = (t: number) => lerp(X_START, X_END, (t - tMin) / tRange);

    // 6. Points SVG (point de départ inclus pour la polyline)
    const baseX = X_START;
    const baseY = scoreToY(baseScore);
    const points = raw.map((p) => ({ ...p, x: tsToX(p.ts), y: scoreToY(p.score) }));

    const allPts = [{ x: baseX, y: baseY }, ...points];
    const polyStr = allPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaStr = [
      ...allPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `${allPts[allPts.length - 1].x.toFixed(1)},${Y_BOT}`,
      `${X_START},${Y_BOT}`,
    ].join(" ");

    // 7. Ticks Y (5 niveaux)
    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const score = Math.round(lerp(yMin, yMax, i / 4));
      return { score, y: scoreToY(score) };
    });

    // 8. Ticks X (max 6 labels répartis)
    const step = Math.max(1, Math.floor((raw.length - 1) / 5));
    const xTicks: { label: string; x: number }[] = [];
    for (let i = 0; i < raw.length; i += step) {
      xTicks.push({ label: fmtDate(raw[i].ts), x: tsToX(raw[i].ts) });
    }
    const last = raw[raw.length - 1];
    if (xTicks[xTicks.length - 1]?.x !== tsToX(last.ts)) {
      xTicks.push({ label: fmtDate(last.ts), x: tsToX(last.ts) });
    }

    return { points, yTicks, xTicks, polyStr, areaStr, netChange: totalPts };
  }, [goEvents, currentScore]);

  if (!chart) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-[#7a90b8]">
        Aucun événement de points enregistré.
      </div>
    );
  }

  const { points, yTicks, xTicks, polyStr, areaStr, netChange } = chart;
  const trendVariant = netChange >= 0 ? "up" : "down";

  return (
    <div>
      {/* Graphique */}
      <div className="w-full overflow-hidden" style={{ aspectRatio: "530/160" }}>
        <div
          ref={containerRef}
          className="zoom-wrap overflow-auto h-full"
          style={{ cursor: scale > 1 ? "zoom-out" : "zoom-in" }}
        >
          <div
            ref={ref}
            className="p-3 px-5"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              transition: "transform 0.3s",
              width: `${100 / scale}%`,
            }}
          >
            <svg viewBox="0 0 530 200" xmlns="http://www.w3.org/2000/svg" className="w-full block">
              <defs>
                <linearGradient id="areaG-go" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0aad6a" stopOpacity=".25" />
                  <stop offset="100%" stopColor="#08316e" stopOpacity=".03" />
                </linearGradient>
              </defs>

              {/* Axes */}
              <line x1={X_START} y1="10" x2={X_START} y2="182" stroke="#c8d4ec" strokeWidth="1" />
              <line x1={X_START} y1="182" x2={X_END}   y2="182" stroke="#c8d4ec" strokeWidth="1" />

              {/* Grille + labels Y */}
              {yTicks.map(({ score, y }) => (
                <g key={score}>
                  <line
                    x1={X_START} y1={y} x2={X_END} y2={y}
                    stroke="#e8edf8" strokeWidth="1" strokeDasharray="3,4"
                  />
                  <text x={X_START - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#7a90b8">
                    {score}
                  </text>
                </g>
              ))}

              {/* Labels X */}
              {xTicks.map(({ label, x }) => (
                <text key={label + x} x={x} y="192" textAnchor="middle" fontSize="8" fill="#7a90b8">
                  {label}
                </text>
              ))}

              {/* Aire dégradée */}
              <polygon points={areaStr} fill="url(#areaG-go)" />

              {/* Polyline tendance */}
              <polyline
                points={polyStr}
                fill="none"
                stroke="rgba(8,49,110,0.2)"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />

              {/* Points de données */}
              {points.map((p, i) => {
                const isLast = i === points.length - 1;
                const fill   = isLast ? "#08316e" : TYPE_COLOR[p.type];
                const r      = isLast ? 9 : p.type === "badge" ? 7 : Math.min(4 + Math.abs(p.delta) / 6, 9);
                const labelColor = TYPE_COLOR[p.type];
                const sign = p.delta >= 0 ? "+" : "";

                return (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y} r={r}
                      fill={fill} opacity={isLast ? 0.95 : 0.85}
                      style={{
                        animation: isVisible
                          ? `scatterPop 0.4s ease ${i * 60 + 100}ms both`
                          : "none",
                      }}
                    />
                    {/* Anneau blanc sur le dernier point */}
                    {isLast && <circle cx={p.x} cy={p.y} r={5} fill="#fff" />}
                    {/* Label delta (si valeur notable) */}
                    {Math.abs(p.delta) >= 10 && (
                      <text
                        x={p.x + r + 2} y={p.y - 2}
                        fontSize="8"
                        fill={isLast ? "#08316e" : labelColor}
                        fontWeight={isLast ? "700" : "400"}
                      >
                        {isLast ? p.score : `${sign}${p.delta}`}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-3 mx-5 my-2 text-[10px] text-[#7a90b8] flex-wrap">
        {(
          [
            ["#0aad6a", "Gain (pts)"],
            ["#e03050", "Perte (pts)"],
            ["#c8960a", "Badge obtenu"],
            ["#08316e", "Score actuel"],
          ] as const
        ).map(([c, l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            {l}
          </div>
        ))}
      </div>

      <TrendMsg
        variant={trendVariant}
        icon={
          <FaRocket
            className={netChange >= 0 ? "text-[#0aad6a]" : "text-[#e03050]"}
          />
        }
      >
        <strong>
          {netChange > 0 ? `+${netChange} pts` : `${netChange} pts`} sur la période affichée.
        </strong>{" "}
        {netChange > 0
          ? "Tendance haussière — continuez sur cette lancée !"
          : netChange < 0
            ? "Tendance baissière — participez à plus de trajets pour remonter."
            : "Aucun changement de score sur la période."}
      </TrendMsg>
    </div>
  );
}

export default ScatterProgression;
