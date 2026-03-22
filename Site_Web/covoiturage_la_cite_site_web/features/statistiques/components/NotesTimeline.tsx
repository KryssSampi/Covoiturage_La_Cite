"use client";

/**
 * NotesTimeline — histogramme temporel des notes avec ligne médiane et ventilation.
 */

import React from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { DonneesNotesHebdo } from "../types/statistiques.types";

// ─── Composant ──────────────────────────────────────────────────────────────

const NotesTimeline: React.FC<{ data: DonneesNotesHebdo[] }> = ({ data }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const SVG_W = 500, SVG_H = 180, WEEK_W = 65, BAR_W = 10, MAX_NOTE = 5, H_AREA = 100;
  const NOTE_H = (n: number) => (n / MAX_NOTE) * H_AREA;

  const medianPoints = data.map((d, wi) => {
    const x = 20 + wi * WEEK_W + (d.notes.length * BAR_W) / 2;
    const y = SVG_H - 20 - NOTE_H(d.mediane);
    return `${x},${y}`;
  });

  return (
    <div ref={ref}>
      <div className="hist-scroll overflow-x-auto">
        <div className="px-5 pt-3" style={{ minWidth: "max-content" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block" style={{ width: SVG_W, height: SVG_H }}>
            {/* Grille */}
            {[1, 2, 3, 4, 5].map((n) => (
              <line key={n} x1={10} y1={SVG_H - 20 - NOTE_H(n)} x2={SVG_W - 5} y2={SVG_H - 20 - NOTE_H(n)} stroke="#e8eef8" strokeWidth={0.5} />
            ))}
            {/* Barres par semaine */}
            {data.map((week, wi) =>
              week.notes.map((note, ni) => {
                const x = 20 + wi * WEEK_W + ni * (BAR_W + 2);
                const h = NOTE_H(note);
                const y = SVG_H - 20 - h;
                const isLow = note <= 3;
                return (
                  <rect key={`${wi}-${ni}`} x={x} y={y} width={BAR_W} height={h}
                    fill={isLow ? "#e03050" : "#c8960a"} opacity={0.4 + ni * 0.1} rx={3}
                    style={{
                      transformOrigin: `${x}px ${SVG_H - 20}px`,
                      transform: isVisible ? "scaleY(1)" : "scaleY(0)",
                      transition: `transform 0.5s ease ${(wi * 3 + ni) * 0.05}s`,
                    }}
                  />
                );
              }),
            )}
            {/* Ligne médiane par semaine */}
            {data.map((week, wi) => {
              const x1 = 17 + wi * WEEK_W;
              const x2 = 17 + wi * WEEK_W + week.notes.length * (BAR_W + 2);
              const y  = SVG_H - 20 - NOTE_H(week.mediane);
              return <line key={wi} x1={x1} y1={y} x2={x2} y2={y} stroke="#c8960a" strokeWidth={2} strokeLinecap="round" />;
            })}
            {/* Polyline médiane globale */}
            <polyline
              points={medianPoints.join(" ")}
              fill="none" stroke="#08316e" strokeWidth={1.5} strokeLinejoin="round"
              style={{ opacity: isVisible ? 0.7 : 0, transition: "opacity 0.8s ease 0.4s" }}
            />
            {/* Cercles sur médiane */}
            {data.map((d, wi) => {
              const x = 20 + wi * WEEK_W + (d.notes.length * BAR_W) / 2;
              const y = SVG_H - 20 - NOTE_H(d.mediane);
              const isLow = d.mediane < 4.5;
              return (
                <circle key={wi} cx={x} cy={y} r={3.5}
                  fill={isLow ? "#e03050" : "#08316e"} opacity={0.85}
                  style={{
                    transform: isVisible ? "scale(1)" : "scale(0)",
                    transformOrigin: `${x}px ${y}px`,
                    transition: `transform 0.4s ease ${0.3 + wi * 0.1}s`,
                  }}
                />
              );
            })}
            {/* Labels semaine */}
            {data.map((d, wi) => (
              <text key={wi} x={20 + wi * WEEK_W + (d.notes.length * (BAR_W + 2)) / 2} y={SVG_H - 6}
                textAnchor="middle" fontSize={7} fill="#7a90b8">{d.semaine}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-3.5 mx-5 my-1.5 text-[10px] text-[#7a90b8] flex-wrap">
        <span className="flex items-center gap-1"><span className="inline-block w-[7px] h-[7px] rounded-full bg-[#c8960a]" />Notes reçues</span>
        <span className="flex items-center gap-1"><span className="inline-block w-[7px] h-[7px] rounded-full bg-[#e03050]" />Note basse</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3.5 h-0.5 bg-[#08316e] rounded-sm" />Médiane hebdo</span>
        <span className="text-[#7a90b8]">← Faire défiler →</span>
      </div>

      {/* Ventilation des notes */}
      <div className="px-5 pb-3.5">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="font-['Syne',sans-serif] font-extrabold text-[44px] text-[#c8960a] leading-none">4.2</div>
          <div>
            <div className="text-xl text-[#c8960a] tracking-widest">★★★★☆</div>
            <div className="text-[11px] text-[#7a90b8] mt-0.5">28 avis · Conducteur</div>
          </div>
        </div>
        {[
          { star: "5 ★", pct: 54, count: 15, color: "#c8960a" },
          { star: "4 ★", pct: 29, count: 8,  color: "#c8960a" },
          { star: "3 ★", pct: 11, count: 3,  color: "#7a90b8" },
          { star: "2 ★", pct: 4,  count: 1,  color: "#e03050" },
          { star: "1 ★", pct: 4,  count: 1,  color: "#e03050" },
        ].map((r) => (
          <div key={r.star} className="flex items-center gap-2 text-[11px] mb-1.5">
            <span className="text-[#7a90b8] w-[34px] text-right shrink-0">{r.star}</span>
            <div className="flex-1 h-1.25 bg-[rgba(8,49,110,0.07)] rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm"
                style={{
                  background: r.color,
                  width: isVisible ? `${r.pct}%` : "0%",
                  transition: "width 0.8s ease 0.3s",
                }}
              />
            </div>
            <span className="text-[#7a90b8] w-5 text-[10px]">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesTimeline;
