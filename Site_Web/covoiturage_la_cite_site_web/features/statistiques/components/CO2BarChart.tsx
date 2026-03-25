"use client";

/**
 * CO2BarChart — histogramme des économies de CO₂ par mois avec animation.
 */

import React from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { CO2Mois } from "../types/statistiques.types";

// ─── Composant ──────────────────────────────────────────────────────────────

const CO2BarChart: React.FC<{ data: CO2Mois[]; co2Total?: number }> = ({ data, co2Total }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const maxKg = Math.max(250, ...data.map((d) => d.kg));
  // Déterminer le mois courant dynamiquement (dernier mois non futur)
  const currentMois = data.filter((d) => !d.isFutur).at(-1)?.mois;
  // Total cumulé : utiliser la prop ou calculer depuis les données
  const totalCumule = co2Total ?? data.reduce((acc, d) => acc + d.kg, 0);

  return (
    <div ref={ref} className="w-full h-full flex flex-col">
      <div className="hist-scroll overflow-x-auto  h-4/5 mt-10">
        <div className="flex items-end gap-2 h-full border-b-[1.5px] border-[rgba(8,49,110,0.09)] pb-2 px-2" style={{ minWidth: "max-content" }}>
          {data.map((d, i) => {
            const h = d.isFutur ? 5 : Math.max(4, (d.kg / maxKg) * 200);
            const isCurrent = d.mois === currentMois;
            return (
              <div key={d.mois} className="flex flex-col items-center gap-0.5 " style={{ minWidth: 44 }}>
                <div className={`text-[8px] font-bold ${d.isFutur ? "text-[#7a90b8]" : "text-[#0aad6a]"}`}>
                  {d.isFutur ? "—" : d.kg}
                </div>
                <div
                  className="w-8 rounded-t "
                  style={{
                    height: `${h}px`,
                    background: d.isFutur
                      ? "rgba(8,49,110,0.09)"
                      : isCurrent
                        ? "linear-gradient(180deg,#00c878,#0aad6a)"
                        : "linear-gradient(180deg,#0aad6a,rgba(10,173,106,0.35))",
                    boxShadow: isCurrent ? "0 0 10px rgba(10,173,106,0.3)" : "none",
                    opacity: d.isFutur ? 0.25 : 1,
                    transformOrigin: "bottom",
                    transform: isVisible ? "scaleY(1)" : "scaleY(0)",
                    transition: `transform 0.6s ease ${0.1 + i * 0.12}s`,
                  }}
                />
                <div className="text-[9px] text-[#7a90b8]">
                  {d.mois}{isCurrent ? " ←" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total cumulé */}
      <div className="text-center my-3 py-3 h-1/5 border-t border-[rgba(8,49,110,0.09)]">
        <div className="font-['Syne',sans-serif] font-extrabold text-xl text-[#0aad6a]">{totalCumule} kg CO₂</div>
        <div className="text-[11px] text-[#7a90b8] mt-0.5">Total cumulé sur la période</div>
      </div>
      <div className="text-[10px] text-[#7a90b8] mx-5 mb-3.5">← Faire défiler →</div>
    </div>
  );
};

export default CO2BarChart;
