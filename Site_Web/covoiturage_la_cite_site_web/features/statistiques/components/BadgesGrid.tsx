"use client";

/**
 * BadgesGrid — grille de badges obtenus ou verrouillés avec icônes.
 */

import React from "react";
import {
  FaCircleCheck, FaCar, FaGaugeHigh, FaSeedling,
  FaMedal, FaStar, FaShareNodes, FaLeaf, FaLock,
} from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { BadgeObtenu } from "../types/statistiques.types";

// ─── Mapping iconKey → composant React Icons ────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FaCircleCheck, FaCar, FaGaugeHigh, FaSeedling,
  FaMedal, FaStar, FaShareNodes, FaLeaf, FaLock,
};

/** Résout l'icône à partir de l'iconKey et l'iconColor fournis par le backend */
const resolveIcon = (iconKey?: string, iconColor?: string): React.ReactNode => {
  const Icon = iconKey ? ICON_MAP[iconKey] : undefined;
  if (!Icon) return <FaMedal size={20} className="text-[#7a90b8]" />;
  return <span style={{ color: iconColor ?? "#7a90b8" }}><Icon size={20} /></span>;
};

// ─── Composant ──────────────────────────────────────────────────────────────

const BadgesGrid: React.FC<{ badges: BadgeObtenu[] }> = ({ badges }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="grid grid-cols-3 gap-2 px-5 py-3.5">
      {badges.map((b, i) => (
        <div
          key={b.id}
          className={`scroll-reveal${isVisible ? " visible" : ""} bg-[#f0f4fb] border border-[rgba(8,49,110,0.09)] rounded-[10px] p-3 text-center transition-all duration-200 ${
            b.locked ? "opacity-30" : "hover:-translate-y-0.5"
          }`}
          style={{ transitionDelay: `${i * 50}ms` }}
        >
          <div className="flex justify-center mb-1">{resolveIcon(b.iconKey, b.iconColor)}</div>
          <div className="text-[10px] font-bold text-[#0d1f3c]">{b.nom}</div>
          <div className="text-[9px] text-[#7a90b8] mt-0.5">{b.description}</div>
          <div className={`text-[9px] mt-0.5 flex items-center justify-center gap-0.5 ${b.locked ? "text-[#7a90b8]" : "text-[#c8960a]"}`}>
            {b.locked ? <><FaLock size={8} /> {b.restant}</> : b.date}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BadgesGrid;
