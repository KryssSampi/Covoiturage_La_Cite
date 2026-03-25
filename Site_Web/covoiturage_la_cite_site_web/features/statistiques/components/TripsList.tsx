"use client";

/**
 * TripsList — liste des derniers trajets avec icône de statut, infos et montant.
 */

import React from "react";
import { FaXmark, FaCar, FaSeedling } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { TrajetResume } from "../types/statistiques.types";

// ─── Composant ──────────────────────────────────────────────────────────────

const TripsList: React.FC<{ trips: TrajetResume[] }> = ({ trips }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="px-5 pb-3 max-h-[80vh] overflow-y-auto">
      {trips.map((t, i) => (
        <div
          key={t.id}
          className={`scroll-reveal${isVisible ? " visible" : ""} flex items-center gap-3 py-2.5 ${
            i < trips.length - 1 ? "border-b border-[rgba(8,49,110,0.05)]" : ""
          }`}
          style={{ transitionDelay: `${i * 70}ms` }}
        >
          {/* Icône statut */}
          <div
            className={`flex items-center justify-center w-[34px] h-[34px] rounded-lg shrink-0 ${
              t.statut === "annule" ? "bg-[rgba(224,48,80,0.09)]" : "bg-[rgba(10,173,106,0.1)]"
            }`}
          >
            {t.statut === "annule"
              ? <FaXmark size={14} className="text-[#e03050]" />
              : <FaCar size={14} className="text-[#0aad6a]" />}
          </div>

          {/* Infos */}
          <div className="flex-1">
            <div className="font-semibold text-xs">
              {t.route.depart} → {t.route.arrivee}
            </div>
            <div className="text-[10px] text-[#7a90b8] mt-0.5">
              {t.date}
              {t.statut === "annule"
                ? " · Annulé — pénalité appliquée"
                : ` · ${t.nbPassagers} passager${t.nbPassagers > 1 ? "s" : ""} · ${t.distanceKm} km`}
            </div>
          </div>

          {/* Montant */}
          <div className="text-right">
            <div
              className="font-['Syne',sans-serif] font-extrabold text-xs"
              style={{ color: t.gainNet < 0 ? "#e03050" : "#0aad6a" }}
            >
              {t.gainNet > 0 ? "+" : ""}{t.gainNet.toFixed(2)} $
            </div>
            {t.statut !== "annule" && (
              <>
                <div className="text-[10px] text-[#7a90b8] flex items-center justify-end gap-0.5">
                  <FaSeedling size={9} className="text-[#0aad6a]" /> {t.co2EconomiseKg} kg CO₂
                </div>
                {t.noteRecue && (
                  <div className="text-[10px] text-[#c8960a]">
                    {"★".repeat(t.noteRecue)}{"☆".repeat(5 - t.noteRecue)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripsList;
