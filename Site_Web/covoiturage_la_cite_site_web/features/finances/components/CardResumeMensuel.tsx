"use client";

/**
 * CardResumeMensuel — KPI strip 4 colonnes + barres de progression revenus / objectif.
 * Composant de présentation pure : toutes les données viennent du prop `data` (ResumeMensuelData).
 */

import React from "react";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import { FaChartLine } from "react-icons/fa6";
import type { ResumeMensuelData } from "../types/finances.types";

// ─── Props ──────────────────────────────────────────────────────────────
export interface CardResumeMensuelProps {
  data: ResumeMensuelData;
}

// ─── Composant ──────────────────────────────────────────────────────────────

function CardResumeMensuel({ data }: CardResumeMensuelProps) {
  const { revenu, objectif, commission, nbTrajets, nbTrajetsCompletes, gainSemaine, labelSemaine, titre, sousTitre, tendance } = data;
  const commissionAmount = (revenu / (1 - commission)) * commission;
  const revenusBruts = revenu + commissionAmount;
  const pctRevBruts = Math.min((revenusBruts / objectif) * 100, 100);
  const pctNet = Math.min((revenu / objectif) * 100, 100);

  return (
    <Card delay={100} className="md:col-span-2">
      <CardHeader
        dotColor="#0aad6a"
        title={titre}
        right={<span className="text-[11px] text-[#7a90b8]">{sousTitre}</span>}
      />
      {/* KPI strip 4 colonnes */}
      <div className="grid grid-cols-4 gap-px bg-[rgba(8,49,110,0.09)]">
        {[
          { l: "Gain Mensuel",    v: `${revenu.toFixed(2)} $`,                 vc: "#0aad6a", s: tendance.texteBold },
          { l: "Gain Semaine",    v: `${gainSemaine.toFixed(2)} $`,            vc: "#08316e", s: labelSemaine },
          { l: "Commission",      v: `${commissionAmount.toFixed(2)} $`,       vc: "#c8960a", s: `${(commission * 100).toFixed(0)}% plateforme` },
          { l: "Trajets Payants", v: `${nbTrajets}`,                           vc: "#08316e", s: `sur ${nbTrajetsCompletes} complétés` },
        ].map(({ l, v, vc, s }) => (
          <div key={l} className="bg-white p-3.5">
            <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">{l}</div>
            <div className="font-[Syne] font-extrabold text-[21px]" style={{ color: vc }}>{v}</div>
            <div className="text-[10px] text-[#7a90b8] mt-0.5">{s}</div>
          </div>
        ))}
      </div>
      {/* Barres de progression */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {[
          { l: "Revenus bruts",    v: `${revenusBruts.toFixed(2)} $`, pct: pctRevBruts, g: "linear-gradient(90deg,#0aad6a,#00d882)" },
          { l: "Revenus nets",     v: `${revenu.toFixed(2)} $`,       pct: pctNet,      g: "linear-gradient(90deg,#08316e,#1a5cb0)" },
          { l: "Objectif mensuel", v: `${revenu.toFixed(2)} $ / ${objectif} $`, pct: pctNet, g: "linear-gradient(90deg,#c8960a,#e8a020)" },
        ].map(({ l, v, pct, g }) => (
          <div key={l}>
            <div className="flex justify-between text-[11px] text-[#7a90b8] mb-1">
              <span>{l}</span><span className="text-[#0d1f3c] font-semibold">{v}</span>
            </div>
            <div className="h-1.75 bg-[rgba(8,49,110,0.08)] rounded overflow-hidden">
              <div className="h-full rounded transition-[width] duration-1000 ease-out" style={{ width: `${pct}%`, background: g }} />
            </div>
          </div>
        ))}
      </div>
      {/* Message de tendance dynamique */}
      <TrendMsg variant={tendance.variant} icon={<FaChartLine className="text-[#0aad6a]" />}>
        <strong>{tendance.texteBold}</strong>{" "}
        {tendance.texte}
      </TrendMsg>
    </Card>
  );
}

export default CardResumeMensuel;
