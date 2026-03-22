"use client";

/**
 * Carte d'alerte de trajet avec barre de statut colorée,
 * détails des critères et interrupteur d'activation.
 */

import React, { useState } from "react";
import {
  FaCalendarDays, FaClock, FaUser, FaStar, FaMoneyBill,
  FaCheck, FaHourglassHalf, FaPause,
} from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { Language, useAppState } from "@/core/state/app_state";
import Toggle from "./ui/Toggle";
import type { AlerteTrajet, AlerteStatut } from "../types/favoris.types";

// ─── Styles par statut ────────────────────────────────────────────────────────

const getSTATUT_STYLES = (isFR: boolean): Record<AlerteStatut, {
  bar: string; bg: string; text: string; label: string; icon: React.ReactNode; opacity: string;
}> => ({
  actif:      { bar: "bg-[#0aad6a]", bg: "bg-[rgba(10,173,106,0.1)]",  text: "text-[#0aad6a]",  label: isFR ? "Actif" : "Active",           icon: <FaCheck size={8} />,          opacity: "opacity-100" },
  en_attente: { bar: "bg-[#c8960a]", bg: "bg-[rgba(200,150,10,0.09)]", text: "text-[#c8960a]",  label: isFR ? "En attente" : "Pending",    icon: <FaHourglassHalf size={8} />,  opacity: "opacity-100" },
  desactive:  { bar: "bg-[#7a90b8]", bg: "bg-[rgba(8,49,110,0.07)]",   text: "text-[#7a90b8]",  label: isFR ? "Désactivé" : "Disabled",    icon: <FaPause size={8} />,          opacity: "opacity-50" },
});

// ─── Props ───────────────────────────────────────────────────────────────────

interface AlerteCardProps {
  alerte: AlerteTrajet;
  delay?: number;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const AlerteCard: React.FC<AlerteCardProps> = ({ alerte, delay = 0 }) => {
  const [on, setOn] = useState(alerte.statut !== "desactive");
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const s = getSTATUT_STYLES(isFR)[alerte.statut];

  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} relative overflow-hidden bg-[#f0f4fb] border border-[rgba(8,49,110,0.09)] rounded-[10px] p-3.5 transition-all duration-200 ${s.opacity}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Barre de couleur latérale (statut) */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.bar}`} />

      {/* En-tête : destination + badge statut */}
      <div className="flex justify-between items-start gap-1.5">
        <div className="font-['Syne',sans-serif] font-bold text-xs text-[#0d1f3c]">
          {alerte.lieuDepartLabel} → {alerte.lieuArriveeLabel}
        </div>
        <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-[5px] shrink-0 ${s.bg} ${s.text}`}>
          {s.icon} {s.label}
        </span>
      </div>

      {/* Critères de l'alerte */}
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="text-[10px] text-[#7a90b8] flex items-center gap-1">
          <FaCalendarDays size={10} className="text-[#7a90b8]" />
          <strong className="text-[#0d1f3c]">{alerte.joursActifs.join("–")}</strong>
        </span>
        <span className="text-[10px] text-[#7a90b8] flex items-center gap-1">
          <FaClock size={10} className="text-[#7a90b8]" />
          <strong className="text-[#0d1f3c]">{alerte.heureMin}–{alerte.heureMax}</strong>
        </span>
        {alerte.favorisUniquement && (
          <span className="text-[10px] text-[#7a90b8] flex items-center gap-1">
            <FaUser size={10} className="text-[#7a90b8]" />
            {isFR ? 'Favoris' : 'Favourites'} <strong className="text-[#0d1f3c]">{isFR ? 'seulement' : 'only'}</strong>
          </span>
        )}
        {alerte.noteMinimale > 0 && (
          <span className="text-[10px] text-[#7a90b8] flex items-center gap-1">
            <FaStar size={10} className="text-[#c8960a]" />
            Min <strong className="text-[#0d1f3c]">{alerte.noteMinimale}</strong>
          </span>
        )}
        {alerte.prixMax && (
          <span className="text-[10px] text-[#7a90b8] flex items-center gap-1">
            <FaMoneyBill size={10} className="text-[#7a90b8]" />
            Max <strong className="text-[#0d1f3c]">{alerte.prixMax}$</strong>
          </span>
        )}
      </div>

      {/* Bas : dernière correspondance + bascule */}
      <div className="flex justify-between items-center mt-2.5">
        <div className="text-[10px] text-[#7a90b8]">
          {alerte.statut === "en_attente" ? (
            <>{isFR ? 'Aucun match' : 'No match'} <span className="text-[#c8960a]">{isFR ? '5 jours' : '5 days'}</span></>
          ) : alerte.derniereCorrespondance ? (
            <>Match <span className="text-[#08316e] font-semibold">{alerte.derniereCorrespondance}</span></>
          ) : alerte.statut === "desactive" ? (
            isFR ? "Dernier match : il y a 3 sem." : "Last match: 3 weeks ago"
          ) : null}
        </div>
        <Toggle on={on} onChange={setOn} />
      </div>
    </div>
  );
};

export default AlerteCard;
