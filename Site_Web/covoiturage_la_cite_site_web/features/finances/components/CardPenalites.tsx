"use client";

/**
 * CardPenalites — liste des pénalités actives avec possibilité de contestation.
 * Composant de présentation pure : description et routeDescription viennent des props.
 */

import React from "react";
import { FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { Penalite, TrendMessage } from "../types/finances.types";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CardPenalitesProps {
  penalites: Penalite[];
  tendance?: TrendMessage;
}

// ─── Composant ──────────────────────────────────────────────────────────────

function CardPenalites({ penalites, tendance }: CardPenalitesProps) {
  const total = penalites.reduce((s, p) => s + p.montant, 0);
  return (
    <Card delay={200}>
      <CardHeader
        dotColor="#e03050"
        title="Pénalités Actives"
        right={<span className="font-[Syne] font-extrabold text-sm text-[#e03050]">{total.toFixed(2)} $</span>}
      />
      <div className="px-5 pb-3">
        {penalites.map((p, i) => (
          <div key={p.id} className="py-3" style={{ borderBottom: i < penalites.length - 1 ? "1px solid rgba(8,49,110,0.05)" : "none" }}>
            <div className="flex justify-between items-center">
              <div className="font-semibold text-xs flex items-center gap-1.5">
                {p.raison === "retard"
                  ? <><FaTriangleExclamation size={12} className="text-[#e03050]" /> {p.description}</>
                  : <><FaXmark size={12} className="text-[#e03050]" /> {p.description}</>}
              </div>
              <div className="font-[Syne] font-extrabold text-sm text-[#e03050]">{p.montant.toFixed(2)} $</div>
            </div>
            <div className="text-[10px] text-[#7a90b8] mt-1">
              {p.routeDescription}
            </div>
            <span className="text-[10px] text-[#08316e] cursor-pointer mt-1 inline-block font-semibold">
              {p.estContestable ? "Contester →" : "Voir les détails →"}
            </span>
          </div>
        ))}
      </div>
      {/* Message de tendance dynamique — affiché seulement si fourni */}
      {tendance && (
        <TrendMsg variant={tendance.variant} icon={<FaTriangleExclamation className="text-[#e03050]" />}>
          <strong>{tendance.texteBold}</strong>{" "}
          {tendance.texte}
        </TrendMsg>
      )}
    </Card>
  );
}

export default CardPenalites;
