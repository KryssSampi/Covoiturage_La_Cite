"use client";

/**
 * CardPenalites — liste des pénalités actives avec possibilité de contestation.
 */

import React from "react";
import { FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { Penalite } from "../types/finances.types";

function CardPenalites({ penalites }: { penalites: Penalite[] }) {
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
                  ? <><FaTriangleExclamation size={12} className="text-[#e03050]" /> Retard 18 min</>
                  : <><FaXmark size={12} className="text-[#e03050]" /> Annulation &lt;24h</>}
              </div>
              <div className="font-[Syne] font-extrabold text-sm text-[#e03050]">{p.montant.toFixed(2)} $</div>
            </div>
            <div className="text-[10px] text-[#7a90b8] mt-1">
              {p.raison === "retard" ? "Ottawa → Campus · 10 mars 08h30" : "Ottawa → Montréal · 8 mars · 2 passagers"}
            </div>
            <span className="text-[10px] text-[#08316e] cursor-pointer mt-1 inline-block font-semibold">
              {p.estContestable ? "Contester →" : "Voir les détails →"}
            </span>
          </div>
        ))}
      </div>
      <TrendMsg variant="down" icon={<FaTriangleExclamation className="text-[#e03050]" />}>
        <strong>2 pénalités actives ce mois.</strong>{" "}
        L&apos;annulation de moins de 24h représente 63% du total. Prévenez vos passagers à l&apos;avance pour éviter les pénalités futures.
      </TrendMsg>
    </Card>
  );
}

export default CardPenalites;
