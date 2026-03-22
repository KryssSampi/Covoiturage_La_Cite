"use client";

/**
 * PeriodSelector — sélecteur de périodes pour la page Finances.
 */

import React from "react";
import type { PeriodeFinance } from "../../types/finances.types";

// ─── Labels de période ───────────────────────────────────────────────────────

const PERIODE_LABELS: Record<PeriodeFinance, string> = {
  "7j": "7 jours",
  mois: "Ce mois",
  "3mois": "3 mois",
  tout: "Tout",
};

// ─── Composant ──────────────────────────────────────────────────────────────

function PeriodSelector({ periodes, active, onChange }: {
  periodes: PeriodeFinance[];
  active: PeriodeFinance;
  onChange: (p: PeriodeFinance) => void;
}) {
  return (
    <div className="flex gap-2 mt-3">
      {periodes.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors"
          style={{
            background: active === p ? "rgba(255,255,255,0.2)" : "transparent",
            border:     active === p ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.15)",
            color:      active === p ? "#fff" : "rgba(255,255,255,0.6)",
          }}
        >
          {PERIODE_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

export default PeriodSelector;
