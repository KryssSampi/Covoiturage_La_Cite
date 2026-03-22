"use client";

/**
 * Composant message de tendance pour la page Favoris.
 * Réutilise TendanceVariant de statistiques (up | down | stable | warn).
 */

import React from "react";
import type { TendanceVariant } from "@/features/statistiques/types/statistiques.types";

// ─── Palette par variante ────────────────────────────────────────────────────

const TREND_STYLES: Record<TendanceVariant, { bg: string; border: string; text: string }> = {
  up:     { bg: "bg-[rgba(10,173,106,0.08)]",  border: "border-l-[#0aad6a]", text: "text-[#0a7a4c]" },
  down:   { bg: "bg-[rgba(224,48,80,0.07)]",   border: "border-l-[#e03050]", text: "text-[#9a2030]" },
  stable: { bg: "bg-[rgba(8,49,110,0.07)]",    border: "border-l-[#08316e]", text: "text-[#08316e]" },
  warn:   { bg: "bg-[rgba(200,150,10,0.09)]",  border: "border-l-[#c8960a]", text: "text-[#8a6000]" },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface TrendMsgProps {
  variant: TendanceVariant;
  icon: React.ReactNode;
  children: React.ReactNode;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const TrendMsg: React.FC<TrendMsgProps> = ({ variant, icon, children }) => {
  const s = TREND_STYLES[variant];
  return (
    <div
      className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border-l-[3px] text-xs leading-relaxed mb-4 ${s.bg} ${s.border} ${s.text}`}
    >
      <span className="text-[15px] shrink-0 mt-0.5">{icon}</span>
      <span>{children}</span>
    </div>
  );
};

export default TrendMsg;
