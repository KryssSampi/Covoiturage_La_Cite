"use client";

/**
 * CardDefis — liste les défis écologiques avec barres de progression et badges de statut.
 */

import React from "react";
import { FaSeedling, FaLeaf, FaLock } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { DefiEcologique } from "../types/goboard.types";

// Mapping icône par nom de défi
const DEFI_ICONS: Record<string, React.ReactNode> = {
  "Éco-Conscient": <FaSeedling size={11} className="text-[#0aad6a]" />,
  "Éco-Warrior":   <FaLeaf size={11} className="text-[#0aad6a]" />,
  "Éco-Débutant":  <FaSeedling size={11} className="text-[#c8960a]" />,
};

function CardDefis({ defis }: { defis: DefiEcologique[] }) {
  return (
    <Card delay={250}>
      <CardHeader
        dotColor="#0aad6a"
        title="Défis Écologiques"
        right={
          <span className="text-[#0aad6a] text-[11px] font-semibold flex items-center gap-1">
            <FaSeedling size={10} /> Actifs
          </span>
        }
      />
      <div className="px-5 py-3 flex flex-col gap-2.5">
        {defis.map((d) => {
          const isActive   = d.statut === "actif";
          const isLocked   = d.statut === "verrouille";
          const isComplete = d.statut === "complete";
          const barColor   = isComplete ? "linear-gradient(90deg,#c8960a,#e8a020)" : "linear-gradient(90deg,#0aad6a,#00d882)";
          const pctColor   = isComplete ? "#c8960a" : isLocked ? "#7a90b8" : "#0aad6a";
          return (
            <div
              key={d.id}
              className="bg-[#f0f4fb] border border-[rgba(8,49,110,0.09)] rounded-xl p-3"
              style={{ opacity: isComplete ? 0.7 : 1 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-[Syne] font-bold text-xs text-[#0d1f3c] flex items-center gap-1.5">
                  {DEFI_ICONS[d.nom] || <FaSeedling size={11} className="text-[#08316e]" />} {d.nom}
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-[5px] shrink-0"
                  style={{
                    background: isActive ? "rgba(10,173,106,0.1)" : isLocked ? "rgba(8,49,110,0.07)" : "rgba(200,150,10,0.09)",
                    color:      isActive ? "#0aad6a"              : isLocked ? "#7a90b8"              : "#c8960a",
                  }}
                >
                  {isActive ? "En cours" : isLocked ? <span className="flex items-center gap-0.5"><FaLock size={7} /> Verrouillé</span> : "Complété"}
                </span>
              </div>
              <div className="text-[10px] text-[#7a90b8] mt-1">{d.cible}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.25 bg-[rgba(8,49,110,0.08)] rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-[width] duration-1000 ease-out"
                    style={{ width: `${d.progres}%`, background: barColor, opacity: isLocked ? 0.4 : 1 }}
                  />
                </div>
                <div className="text-[10px] font-bold" style={{ color: pctColor }}>{d.progres}%</div>
              </div>
              {isActive && <div className="text-[10px] text-[#c8960a] mt-1">{d.recompense}</div>}
            </div>
          );
        })}
      </div>
      <TrendMsg variant="up" icon={<FaLeaf className="text-[#0aad6a]" />}>
        <strong>Éco-Conscient à 47%</strong> — il vous reste environ 265 km CO₂ pour le compléter. À votre rythme actuel, vous l&apos;obtiendrez dans ~3 semaines.
      </TrendMsg>
    </Card>
  );
}

export default CardDefis;
