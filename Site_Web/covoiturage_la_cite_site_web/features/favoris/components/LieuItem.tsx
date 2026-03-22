"use client";

/**
 * Carte d'un lieu favori avec icône par tag, adresse, compteur
 * de trajets et bouton de suppression.
 */

import React from "react";
import { FaGraduationCap, FaHouse, FaBriefcase, FaBuilding, FaXmark } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { LieuFavori, LieuFavoriTag } from "../types/favoris.types";

// ─── Tables de correspondance tag → icône / fond ─────────────────────────────

const TAG_ICON: Record<LieuFavoriTag, React.ReactNode> = {
  campus:   <FaGraduationCap className="text-[#08316e]" />,
  domicile: <FaHouse         className="text-[#0aad6a]" />,
  travail:  <FaBriefcase     className="text-[#c8960a]" />,
  autre:    <FaBuilding      className="text-[#0098c8]" />,
};

const TAG_BG: Record<LieuFavoriTag, string> = {
  campus:   "bg-[rgba(8,49,110,0.09)]",
  domicile: "bg-[rgba(10,173,106,0.11)]",
  travail:  "bg-[rgba(200,150,10,0.11)]",
  autre:    "bg-[rgba(0,152,200,0.11)]",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface LieuItemProps {
  lieu: LieuFavori;
  onDelete?: (id: string) => void;
  delay?: number;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const LieuItem: React.FC<LieuItemProps> = ({ lieu, onDelete, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} flex items-center gap-3 p-3 bg-[#f0f4fb] rounded-[10px] border border-[rgba(8,49,110,0.09)] cursor-pointer transition-all duration-200 hover:border-[#08316e]`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icône de catégorie */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg text-lg shrink-0 ${TAG_BG[lieu.icon]}`}>
        {TAG_ICON[lieu.icon]}
      </div>

      {/* Informations du lieu */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13px] text-[#0d1f3c]">{lieu.label}</div>
        <div className="text-[#7a90b8] text-[11px] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
          {lieu.adresse}
        </div>
      </div>

      {/* Nombre de trajets */}
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-[5px] bg-[rgba(8,49,110,0.13)] text-[#08316e] tracking-wide shrink-0">
        {lieu.nbTrajets} trajets
      </span>

      {/* Bouton de suppression */}
      <button
        onClick={() => onDelete?.(lieu.id)}
        className="flex items-center justify-center w-[26px] h-[26px] rounded-md bg-transparent border-none cursor-pointer text-[#7a90b8] hover:text-[#e03050] transition-colors duration-200"
        aria-label={`Supprimer ${lieu.label}`}
      >
        <FaXmark size={12} />
      </button>
    </div>
  );
};

export default LieuItem;
