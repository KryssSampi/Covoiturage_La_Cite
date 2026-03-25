"use client";

/**
 * CardHistoriquePoints — historique des GoEvents (tâches complétées et autres événements).
 * Affiche une liste scrollable verticalement sans bouton "Voir tout".
 */

import React from "react";
import {
  FaCar, FaStar, FaMedal,
  FaTrophy, FaSeedling, FaClipboardList, FaCircleCheck,
} from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { GoEvent } from "../types/goboard.types";

// ─── Mapping icône par mot-clé dans le titre ─────────────────────────────────
function getEventIcon(titre: string): { icon: React.ReactNode; bg: string } {
  if (titre.includes("Tâche")) return { icon: <FaCircleCheck size={12} className="text-[#0aad6a]" />, bg: "rgba(10,173,106,0.1)" };
  if (titre.includes("Trajet")) return { icon: <FaCar size={12} className="text-[#0aad6a]" />, bg: "rgba(10,173,106,0.1)" };
  if (titre.includes("Éval") || titre.includes("avis")) return { icon: <FaStar size={12} className="text-[#0aad6a]" />, bg: "rgba(10,173,106,0.1)" };
  if (titre.includes("Badge")) return { icon: <FaMedal size={12} className="text-[#c8960a]" />, bg: "rgba(200,150,10,0.09)" };
  if (titre.includes("Éco") || titre.includes("Défi")) return { icon: <FaSeedling size={12} className="text-[#c8960a]" />, bg: "rgba(200,150,10,0.09)" };
  if (titre.includes("consécutifs") || titre.includes("classement")) return { icon: <FaTrophy size={12} className="text-[#c8960a]" />, bg: "rgba(200,150,10,0.09)" };
  return { icon: <FaCar size={12} className="text-[#08316e]" />, bg: "rgba(8,49,110,0.06)" };
}

/** Formateur de date relative */
function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000)  return "Aujourd'hui";
  if (diff < 172800000) return "Hier";
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Composant ──────────────────────────────────────────────────────────────

function CardHistoriquePoints({ goEvents }: { goEvents: GoEvent[] }) {
  const totalPoints = goEvents.reduce((sum, e) => sum + e.points, 0);

  return (
    <Card delay={300}>
      <CardHeader
        dotColor="#08316e"
        title="Historique des Points GoScore"
        right={<span className="text-[#7a90b8] text-[11px]">{goEvents.length} événements</span>}
      />
      {/* Liste scrollable verticalement */}
      <div className="px-5 pb-3 max-h-72 overflow-y-auto">
        {goEvents.map((event) => {
          const cfg = getEventIcon(event.titre);
          return (
            <div
              key={event.id}
              className="flex items-center gap-2.5 py-2.5 border-b border-[rgba(8,49,110,0.05)] last:border-b-0"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                {cfg.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[11px] text-[#0d1f3c]">{event.titre}</div>
                <div className="text-[#7a90b8] text-[9px] mt-0.5">{formatEventDate(event.date)}</div>
              </div>
              <div className="font-[Syne] font-extrabold text-xs text-[#0aad6a]">
                +{event.points}
              </div>
            </div>
          );
        })}
        {goEvents.length === 0 && (
          <div className="text-center text-[#7a90b8] text-xs py-6">Aucun événement pour le moment.</div>
        )}
      </div>
      {goEvents.length > 0 && (
        <TrendMsg variant="stable" icon={<FaClipboardList className="text-[#08316e]" />}>
          <strong>{totalPoints} points accumulés</strong> grâce à {goEvents.length} événements — chaque action compte pour votre progression.
        </TrendMsg>
      )}
    </Card>
  );
}

export default CardHistoriquePoints;
