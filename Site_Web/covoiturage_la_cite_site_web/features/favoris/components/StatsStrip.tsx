"use client";

/**
 * Bande de 4 statistiques : total lieux, trajets, distance et temps moyens.
 * Utilisée en bas de la liste des lieux favoris.
 */

import React from "react";
import { Language, useAppState } from "@/core/state/app_state";

// ─── Props ───────────────────────────────────────────────────────────────────

interface StatsStripProps {
  stats: {
    totalLieux: number;
    totalTrajets: number;
    distanceMoyenneKm: number;
    tempsMoyenMin: number;
  };
}

// ─── Composant ───────────────────────────────────────────────────────────────

const StatsStrip: React.FC<StatsStripProps> = ({ stats }) => {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const items = [
    { value: stats.totalLieux,                    label: isFR ? "Lieux" : "Places" },
    { value: stats.totalTrajets,                  label: isFR ? "Trajets" : "Trips" },
    { value: `${stats.distanceMoyenneKm} km`,     label: isFR ? "Dist. moy." : "Avg dist." },
    { value: `${stats.tempsMoyenMin} min`,         label: isFR ? "Temps moy." : "Avg time" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-5 pb-4 pt-2">
      {items.map((it) => (
        <div key={it.label} className="text-center">
          <div className="font-['Syne',sans-serif] font-extrabold text-lg text-[#08316e]">
            {it.value}
          </div>
          <div className="text-[9px] text-[#7a90b8]">{it.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsStrip;
