"use client";

/**
 * Carte d'alerte de trajet avec barre de statut colorée,
 * détails des critères, lien vers la recherche, bascule et suppression.
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  FaCalendarDays, FaClock, FaUser, FaStar, FaMoneyBill,
  FaCheck, FaPause, FaXmark, FaRoute,
} from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { Language, useAppState } from "@/core/state/app_state";
import Toggle from "./ui/Toggle";
import type { AlerteTrajet, AlerteStatut } from "../types/favoris.types";

// ─── Styles par statut (uniquement actif / desactive) ─────────────────────────

const getSTATUT_STYLES = (isFR: boolean): Record<AlerteStatut, {
  bar: string; bg: string; text: string; label: string; icon: React.ReactNode; opacity: string;
}> => ({
  actif:     { bar: "bg-[#0aad6a]", bg: "bg-[rgba(10,173,106,0.1)]", text: "text-[#0aad6a]", label: isFR ? "Actif" : "Active",        icon: <FaCheck size={8} />, opacity: "opacity-100" },
  desactive: { bar: "bg-[#7a90b8]", bg: "bg-[rgba(8,49,110,0.07)]",  text: "text-[#7a90b8]", label: isFR ? "Désactivé" : "Disabled",  icon: <FaPause size={8} />, opacity: "opacity-50" },
});

// ─── Props ───────────────────────────────────────────────────────────────────

interface AlerteCardProps {
  alerte: AlerteTrajet;
  delay?: number;
  /** Callback toggle — attend la confirmation backend avant de mettre à jour */
  onToggle?: (alerteId: string, newState: boolean) => Promise<{ ok: boolean }>;
  /** Callback de suppression de l'alerte */
  onDelete?: (alerteId: string) => Promise<{ ok: boolean }>;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const AlerteCard: React.FC<AlerteCardProps> = ({ alerte, delay = 0, onToggle, onDelete }) => {
  const [on, setOn] = useState(alerte.surveyIsOn);
  const [loading, setLoading] = useState(false);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const s = getSTATUT_STYLES(isFR)[on ? "actif" : "desactive"];

  /** Toggle avec attente de la confirmation backend */
  const handleToggle = async (newState: boolean) => {
    if (loading || !onToggle) return;
    setLoading(true);
    try {
      const result = await onToggle(alerte.id, newState);
      if (result.ok) setOn(newState);
    } finally {
      setLoading(false);
    }
  };

  /** Suppression de l'alerte */
  const handleDelete = async () => {
    if (loading || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(alerte.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} relative overflow-hidden bg-[#f0f4fb] border border-[rgba(8,49,110,0.09)] rounded-[10px] p-3.5 transition-all duration-200 ${s.opacity} ${loading ? "pointer-events-none" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Indicateur de chargement — couvre la carte pendant le toggle */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center rounded-[10px]">
          <div className="animate-spin w-5 h-5 border-2 border-[#08316e] border-t-transparent rounded-full" />
        </div>
      )}
      {/* Barre de couleur latérale (statut) */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.bar}`} />

      {/* En-tête : destination + badge statut + bouton suppression */}
      <div className="flex justify-between items-start gap-1.5">
        <div className="font-['Syne',sans-serif] font-bold text-xs text-[#0d1f3c]">
          {alerte.lieuDepartLabel} → {alerte.lieuArriveeLabel}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-[5px] ${s.bg} ${s.text}`}>
            {s.icon} {s.label}
          </span>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-5 h-5 rounded-md border-none bg-[rgba(224,48,80,0.08)] cursor-pointer text-[#e03050] hover:bg-[rgba(224,48,80,0.18)] transition-colors"
              title={isFR ? "Supprimer l'alerte" : "Delete alert"}
            >
              <FaXmark size={10} />
            </button>
          )}
        </div>
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

      {/* Bas : lien vers la recherche + bascule */}
      <div className="flex justify-between items-center mt-2.5">
        <Link
          href="/search"
          className="flex items-center gap-1 text-[10px] font-semibold text-[#08316e] no-underline hover:underline"
        >
          <FaRoute size={10} /> {isFR ? "Voir les trajets" : "View trips"}
        </Link>
        <Toggle on={on} onChange={handleToggle} />
      </div>
    </div>
  );
};

export default AlerteCard;
