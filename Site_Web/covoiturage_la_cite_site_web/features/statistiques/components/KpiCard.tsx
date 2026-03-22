"use client";

/**
 * KpiCard — carte KPI avec icône, valeur, unité et indicateur de tendance.
 */

import React from "react";
import { FaCar, FaSeedling, FaStar, FaGaugeHigh } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

// ─── Icônes par clé ────────────────────────────────────────────────────────────

const KPI_ICONS: Record<string, React.ReactNode> = {
  trajets: <FaCar size={26} className="text-[#08316e]" />,
  co2:     <FaSeedling size={26} className="text-[#0aad6a]" />,
  note:    <FaStar size={26} className="text-[#c8960a]" />,
  score:   <FaGaugeHigh size={26} className="text-[#08316e]" />,
};

// ─── Props ───────────────────────────────────────────────────────────────

export interface KpiCardProps {
  iconKey: string;
  value: string;
  unit?: string;
  label: string;
  trend: string;
  trendColor: string;
  delay?: number;
}

// ─── Composant ──────────────────────────────────────────────────────────────

const KpiCard: React.FC<KpiCardProps> = ({ iconKey, value, unit, label, trend, trendColor, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} bg-white border border-[rgba(8,49,110,0.09)] rounded-2xl shadow-[0_2px_18px_rgba(8,49,110,0.09)] px-4 py-5 text-center transition-transform duration-200 hover:-translate-y-0.5`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex justify-center mb-1.5">{KPI_ICONS[iconKey]}</div>
      <div className="font-['Syne',sans-serif] font-extrabold text-3xl text-[#08316e]">
        {value}
        {unit && <span className="text-[11px] font-semibold ml-0.5 text-[#7a90b8]">{unit}</span>}
      </div>
      <div className="text-[11px] text-[#7a90b8] mt-1">{label}</div>
      <div className="text-[10px] mt-0.5" style={{ color: trendColor }}>{trend}</div>
    </div>
  );
};

export default KpiCard;
