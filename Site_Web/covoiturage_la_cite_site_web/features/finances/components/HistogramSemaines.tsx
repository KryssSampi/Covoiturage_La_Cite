"use client";

/**
 * HistogramSemaines — histogramme dynamique pour la page Finances.
 * Utilise DonneesHistogramme (label, montantPrincipal, montantSecondaire) au lieu de valeurs codées en dur.
 * Le message de tendance vient des props.
 */

import React from "react";
import { FaChartLine } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import TrendMsg from "./ui/TrendMsg";
import type { DonneesHistogramme, TrendMessage } from "../types/finances.types";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface HistogramSemainesProps {
  data: DonneesHistogramme[];
  tendance: TrendMessage;
  role: "driver" | "passenger";
}

// ─── Composant ──────────────────────────────────────────────────────────────

function HistogramSemaines({ data, tendance, role }: HistogramSemainesProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const maxVal = Math.max(...data.map((d) => d.montantPrincipal), 1);
  const maxH = 83;

  // Libellés de légende adaptés au rôle
  const legendePrincipal = role === "driver" ? "Revenus bruts" : "Dépenses";
  const legendeSecondaire = role === "driver" ? "Pénalités" : "Remboursements";

  return (
    <div>
      <div className="px-5 pt-3.5 flex flex-col items-start h-full">
        <div
          className="hist-scroll overflow-x-auto pb-1.5 h-4/5 w-full"
          style={{ WebkitOverflowScrolling: "touch", cursor: "grab" }}
        >
          <div
            ref={ref}
            className="flex items-end gap-2 h-full border-b-[1.5px] border-[rgba(8,49,110,0.09)] pb-2 pr-4"
            style={{ minWidth: "max-content" }}
          >
            {data.map((d, i) => {
              const h = d.montantPrincipal > 0 ? Math.max((d.montantPrincipal / maxVal) * maxH, 4) : 6;
              const secH = d.montantSecondaire > 0 ? Math.max((d.montantSecondaire / maxVal) * maxH * 0.6, 4) : 0;
              const isFuture = d.montantPrincipal === 0;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5" style={{ minWidth: 44, opacity: isFuture ? 0.3 : 1 }}>
                  <div className="text-[8px] text-[#0aad6a] font-bold">{d.montantPrincipal > 0 ? `${d.montantPrincipal}$` : "—"}</div>
                  <div
                    className="w-6.5 rounded-t-[5px]"
                    style={{
                      minHeight: 4, height: isVisible ? h : 4,
                      background: "linear-gradient(180deg,#0aad6a,rgba(10,173,106,0.35))",
                      transition: isVisible ? `height 0.5s ease ${i * 60}ms` : "none",
                      transformOrigin: "bottom",
                    }}
                  />
                  {secH > 0 && (
                    <div
                      className="w-6.5 -mt-px"
                      style={{
                        height: isVisible ? secH : 0,
                        background: "linear-gradient(180deg,#e03050,rgba(224,48,80,0.35))",
                        transition: isVisible ? `height 0.5s ease ${i * 60 + 100}ms` : "none",
                      }}
                    />
                  )}
                  <div className="text-[9px] text-[#7a90b8] text-center whitespace-nowrap">{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Légende */}
        <div className="flex gap-3.5 h-fit mt-2.5 text-[10px] text-[#7a90b8]">
          <span className="flex items-center gap-1"><span className="inline-block w-1.75 h-1.75 bg-[#0aad6a] rounded-sm" />{legendePrincipal}</span>
          <span className="flex items-center gap-1"><span className="inline-block w-1.75 h-1.75 bg-[#e03050] rounded-sm" />{legendeSecondaire}</span>
          <span className="text-[#aaa]">← Faire défiler →</span>
        </div>
      </div>
      {/* Message de tendance dynamique */}
      <TrendMsg variant={tendance.variant} icon={<FaChartLine className="text-[#0aad6a] h-1/5 " />}>
        <strong>{tendance.texteBold}</strong>{" "}
        {tendance.texte}
      </TrendMsg>
    </div>
  );
}

export default HistogramSemaines;
