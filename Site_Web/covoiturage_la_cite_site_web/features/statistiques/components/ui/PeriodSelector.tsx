"use client";

/**
 * PeriodSelector — sélecteur de périodes d'analyse (7j, mois, 3mois…).
 */

import React from "react";
import type { Periode } from "../../types/statistiques.types";

// ─── Labels de période ───────────────────────────────────────────────────────

const PERIODE_LABEL: Record<Periode, string> = {
  "7j": "7 jours",
  mois: "Ce mois",
  "3mois": "3 mois",
  "6mois": "6 mois",
  tout: "Tout",
};

// ─── Composant ──────────────────────────────────────────────────────────────

const PeriodSelector: React.FC<{ periodes: Periode[]; active: Periode; onChange: (v: Periode) => void }> = ({
  periodes, active, onChange,
}) => (
  <div className="flex gap-1.5 flex-wrap mt-5">
    {periodes.map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 font-['DM_Sans',sans-serif] ${
          active === p
            ? "bg-white text-[#08316e] border-none"
            : "bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.75)] border border-[rgba(255,255,255,0.2)]"
        }`}
      >
        {PERIODE_LABEL[p]}
      </button>
    ))}
  </div>
);

export default PeriodSelector;
