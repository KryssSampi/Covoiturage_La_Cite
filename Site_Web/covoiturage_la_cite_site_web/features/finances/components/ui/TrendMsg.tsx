"use client";

/**
 * TrendMsg — message de tendance pour la page Finances.
 * Style : fond coloré, bordure inline, texte sombre.
 */

import React from "react";

// ─── Types et styles ────────────────────────────────────────────────────────

export type TrendVariant = "up" | "down" | "stable" | "warn";

const TREND_STYLES: Record<TrendVariant, { bg: string; border: string }> = {
  up:     { bg: "rgba(10,173,106,0.07)",  border: "rgba(10,173,106,0.18)" },
  down:   { bg: "rgba(224,48,80,0.06)",    border: "rgba(224,48,80,0.15)"  },
  stable: { bg: "rgba(8,49,110,0.05)",     border: "rgba(8,49,110,0.12)"   },
  warn:   { bg: "rgba(200,150,10,0.06)",   border: "rgba(200,150,10,0.15)" },
};

// ─── Composant ──────────────────────────────────────────────────────────────

function TrendMsg({ variant, icon, children }: { variant: TrendVariant; icon: React.ReactNode; children: React.ReactNode }) {
  const s = TREND_STYLES[variant];
  return (
    <div
      className="flex items-start gap-2.5 mx-5 my-2 rounded-xl px-4 py-3 text-xs leading-relaxed"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: "#0d1f3c" }}
    >
      <span className="text-sm shrink-0 mt-0.5">{icon}</span>
      <p className="m-0">{children}</p>
    </div>
  );
}

export default TrendMsg;
