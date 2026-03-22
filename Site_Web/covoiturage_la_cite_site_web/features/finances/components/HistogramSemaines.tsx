"use client";

/**
 * HistogramSemaines — histogramme des revenus et pénalités par semaine pour la page Finances.
 */

import React from "react";
import { FaChartLine } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import TrendMsg from "./ui/TrendMsg";
import type { DonneesSemaine } from "../types/finances.types";

// ─── Composant ──────────────────────────────────────────────────────────────

function HistogramSemaines({ data }: { data: DonneesSemaine[] }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const maxVal = Math.max(...data.map((d) => d.revenusBruts), 1);
  const maxH = 83;

  return (
    <div>
      <div className="px-5 pt-3.5">
        <div
          className="hist-scroll overflow-x-auto pb-1.5"
          style={{ WebkitOverflowScrolling: "touch", cursor: "grab" }}
        >
          <div
            ref={ref}
            className="flex items-end gap-2 h-30 border-b-[1.5px] border-[rgba(8,49,110,0.09)] pb-2 pr-4"
            style={{ minWidth: "max-content" }}
          >
            {data.map((d, i) => {
              const h = d.revenusBruts > 0 ? Math.max((d.revenusBruts / maxVal) * maxH, 4) : 6;
              const penH = d.penalites > 0 ? Math.max((d.penalites / maxVal) * maxH * 0.6, 4) : 0;
              const isCurrent = d.semaine.includes("S10");
              const isFuture = d.revenusBruts === 0 && !isCurrent;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5" style={{ minWidth: 44, opacity: isFuture ? 0.3 : 1 }}>
                  <div className="text-[8px] text-[#0aad6a] font-bold">{d.revenusBruts > 0 ? `${d.revenusBruts}$` : "—"}</div>
                  <div
                    className="w-6.5 rounded-t-[5px]"
                    style={{
                      minHeight: 4, height: isVisible ? h : 4,
                      background: "linear-gradient(180deg,#0aad6a,rgba(10,173,106,0.35))",
                      boxShadow: isCurrent ? "0 0 10px rgba(10,173,106,0.3)" : undefined,
                      transition: isVisible ? `height 0.5s ease ${i * 60}ms` : "none",
                      transformOrigin: "bottom",
                    }}
                  />
                  {penH > 0 && (
                    <div
                      className="w-6.5 -mt-px"
                      style={{
                        height: isVisible ? penH : 0,
                        background: "linear-gradient(180deg,#e03050,rgba(224,48,80,0.35))",
                        transition: isVisible ? `height 0.5s ease ${i * 60 + 100}ms` : "none",
                      }}
                    />
                  )}
                  <div className="text-[9px] text-[#7a90b8] text-center whitespace-nowrap">{d.semaine}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Légende */}
        <div className="flex gap-3.5 mt-2.5 text-[10px] text-[#7a90b8]">
          <span className="flex items-center gap-1"><span className="inline-block w-1.75 h-1.75 bg-[#0aad6a] rounded-sm" />Revenus bruts</span>
          <span className="flex items-center gap-1"><span className="inline-block w-1.75 h-1.75 bg-[#e03050] rounded-sm" />Pénalités</span>
          <span className="text-[#aaa]">← Faire défiler →</span>
        </div>
      </div>
      <TrendMsg variant="up" icon={<FaChartLine className="text-[#0aad6a]" />}>
        <strong>Semaine 10 : votre meilleure semaine du mois à 62 $.</strong>{" "}
        La tendance des 4 dernières semaines est à la hausse — continuez au même rythme pour dépasser votre objectif de 200 $.
      </TrendMsg>
    </div>
  );
}

export default HistogramSemaines;
