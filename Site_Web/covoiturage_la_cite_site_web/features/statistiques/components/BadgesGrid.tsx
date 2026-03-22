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

// ─── Icônes de badge par nom ─────────────────────────────────────────────────────

const BADGE_ICONS: Record<string, React.ReactNode> = {
  "Confirmé":      <FaCircleCheck size={20} className="text-[#0aad6a]" />,
  "Régulier":      <FaCar size={20} className="text-[#08316e]" />,
  "Ponctuel":      <FaGaugeHigh size={20} className="text-[#c8960a]" />,
  "Éco-Débutant":  <FaSeedling size={20} className="text-[#0aad6a]" />,
  "Fiable":        <FaMedal size={20} className="text-[#c8960a]" />,
  "Étudiant Cité": <FaStar size={20} className="text-[#08316e]" />,
  "Social":        <FaShareNodes size={20} className="text-[#0098c8]" />,
  "Expert":        <FaMedal size={20} className="text-[#c8960a]" />,
  "Éco-Conscient": <FaLeaf size={20} className="text-[#0aad6a]" />,
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
          <div className="flex justify-center mb-1">{BADGE_ICONS[b.nom] ?? <FaMedal size={20} className="text-[#7a90b8]" />}</div>
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
