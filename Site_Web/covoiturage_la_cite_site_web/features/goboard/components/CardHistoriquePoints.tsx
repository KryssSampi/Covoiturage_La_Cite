"use client";

/**
 * CardHistoriquePoints — historique des points GoScore (gains, pertes, badges).
 */

import React from "react";
import {
  FaCar, FaStar, FaMedal, FaTriangleExclamation,
  FaXmark, FaTrophy, FaSeedling, FaArrowRight, FaClipboardList,
} from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { EntreeHistoriquePts } from "../types/goboard.types";

// ─── Mapping icône + fond par label d’événement ──────────────────────────────
const HIST_ICON_MAP: Record<string, { icon: React.ReactNode; bg: string }> = {
  "Trajet complété":        { icon: <FaCar size={12} className="text-[#0aad6a]" />,                     bg: "rgba(10,173,106,0.1)"  },
  "Éval. 5★ — Pauline D.": { icon: <FaStar size={12} className="text-[#0aad6a]" />,                    bg: "rgba(10,173,106,0.1)"  },
  "Badge : Ponctuel":       { icon: <FaMedal size={12} className="text-[#c8960a]" />,                    bg: "rgba(200,150,10,0.09)" },
  "Retard 18 min":          { icon: <FaTriangleExclamation size={12} className="text-[#e03050]" />,      bg: "rgba(224,48,80,0.09)"  },
  "Trajets ×3":            { icon: <FaCar size={12} className="text-[#0aad6a]" />,                     bg: "rgba(10,173,106,0.1)"  },
  "Annulation <24h":        { icon: <FaXmark size={12} className="text-[#e03050]" />,                    bg: "rgba(224,48,80,0.09)"  },
  "Éval. 5★ ×2":          { icon: <FaStar size={12} className="text-[#0aad6a]" />,                    bg: "rgba(10,173,106,0.1)"  },
  "10 trajets consécutifs": { icon: <FaTrophy size={12} className="text-[#c8960a]" />,                  bg: "rgba(200,150,10,0.09)" },
  "Défi Éco-Débutant":      { icon: <FaSeedling size={12} className="text-[#c8960a]" />,                bg: "rgba(200,150,10,0.09)" },
};

/** Formateur de date relative */
function formatHistDate(d: Date): string {
  const now = new Date("2026-03-13T12:00:00");
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000)  return "Auj. " + d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Hier " + d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
}

// ─── Composant ──────────────────────────────────────────────────────────────

function CardHistoriquePoints({ historique }: { historique: EntreeHistoriquePts[] }) {
  return (
    <Card delay={300}>
      <CardHeader
        dotColor="#08316e"
        title="Historique des Points GoScore"
        right={
          <span className="text-[#08316e] text-[11px] cursor-pointer font-semibold flex items-center gap-1">
            Voir tout <FaArrowRight size={9} />
          </span>
        }
      />
      <div className="px-5 pb-3 grid grid-cols-1 md:grid-cols-3 gap-0">
        {historique.map((h, i) => {
          const cfg = HIST_ICON_MAP[h.label] || { icon: <FaCar size={12} />, bg: "rgba(8,49,110,0.06)" };
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 py-2.5 border-b border-[rgba(8,49,110,0.05)] last:border-b-0"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                {cfg.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[11px]">{h.label}</div>
                <div className="text-[#7a90b8] text-[9px] mt-0.5">{formatHistDate(h.date)}</div>
              </div>
              <div
                className="font-[Syne] font-extrabold text-xs"
                style={{ color: h.signe === "+" ? "#0aad6a" : "#e03050" }}
              >
                {h.signe}{h.pts}
              </div>
            </div>
          );
        })}
      </div>
      <TrendMsg variant="stable" icon={<FaClipboardList className="text-[#08316e]" />}>
        <strong>Vos gains proviennent principalement des trajets complétés et des badges.</strong>{" "}
        Les 2 pénalités représentent seulement 8% de vos points bruts — un excellent ratio.
      </TrendMsg>
    </Card>
  );
}

export default CardHistoriquePoints;
