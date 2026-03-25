"use client";

/**
 * CardClassement — classement hebdomadaire avec top-3, ellipse et rang de l'utilisateur.
 */

import React from "react";
import { FaTrophy, FaChartLine } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { EntreeClassement } from "../types/goboard.types";

// ─── Constantes visuelles du classement ─────────────────────────────────────────
const RANK_AVATARS = [
  { bg: "linear-gradient(135deg,#806000,#c8960a)", init: "M" },
  { bg: "linear-gradient(135deg,#405878,#80b0d0)", init: "J" },
  { bg: "linear-gradient(135deg,#6a3010,#c87830)", init: "S" },
];
const RANK_COLORS = ["#c8960a", "#8090a8", "#c88030"];

// ─── Composant ──────────────────────────────────────────────────────────────

function CardClassement({ classement }: { classement: EntreeClassement[] }) {
  const meEntry = classement.find((e) => e.estMoi);
  const iminthetop = meEntry?.rang !== undefined && meEntry.rang <= 5;
const meIndex = (meEntry?.rang ?? 1) - 1; // ou meEntry.Rang, selon la convention utilisée
const top5 = classement.slice(0, 5);
const othersBeforeMeCount = Math.max(0, meIndex - 5);
const othersAfterMeCount = Math.max(0, classement.length - meIndex - 1);
  // Distance au top 3
  const top1Score = classement[0]?.score ?? 0;
  const myScore = meEntry?.score ?? 0;
  const distanceToTop = top1Score - myScore;

  return (
    <Card delay={200}>
      <CardHeader
        dotColor="#c8960a"
        title="Classement Hebdomadaire"
        right={<span className="text-[#7a90b8] text-[11px]">Mis à jour chaque lundi</span>}
      />
      <div className="px-5 py-3 h-full flex flex-col gap-1.5">
        {/* Top 3 */}
        {top5.map((e, i) => (
          <div key={e.rang} className="flex items-center gap-2.5 py-2 px-3 rounded-xl">
            <div className="font-[Syne] font-extrabold text-sm w-6 text-center shrink-0 " style={{ color:   i < 3 ? RANK_COLORS[i] : "black" }}>
              {e.rang}
            </div>
            <div
              className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white"
              style={{ background: RANK_AVATARS[i]?.bg ?? "linear-gradient(135deg,#08316e,#1a5cb0)" }}
            >
              {e.nom.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xs text-[#0d1f3c] flex items-center gap-1">
                {e.nom} {i === 0 && <FaTrophy size={10} className="text-[#c8960a]" />}
              </div>
              <div className="text-[#7a90b8] text-[10px]">{e.score} pts</div>
            </div>
            <div className="font-[Syne] font-extrabold text-xs text-[#0d1f3c]">{e.score}</div>
          </div>
        ))}
        {/* Ellipse */}
        {othersBeforeMeCount > 0 && (
          <div className="py-1 px-3 text-[10px] text-[#7a90b8] flex items-center gap-2">
            <span className="text-sm">⋯</span>{othersBeforeMeCount} autres participants
          </div>
        )}
        {/* Ligne utilisateur courant */}
        {!iminthetop && meEntry && (
          <div
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-[rgba(8,49,110,0.13)] border border-[rgba(8,49,110,0.2)]"
          >
            <div className="font-[Syne] font-extrabold text-sm w-6 text-center shrink-0 text-[#08316e]">{meEntry.rang}</div>
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white"
              style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
            >
              {meEntry.nom.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xs text-[#0d1f3c]">{meEntry.nom} <span className="text-[9px] text-[#08316e] font-bold">(Vous)</span></div>
              <div className="text-[#7a90b8] text-[10px]">{meEntry.score} pts</div>
            </div>
            <div className="font-[Syne] font-extrabold text-xs text-[#08316e]">{meEntry.score}</div>
          </div>
        )}
        {/* Ellipse */}
        {othersAfterMeCount > 0 && (
          <div className="py-1 px-3 text-[10px] text-[#7a90b8] flex items-center gap-2">
            <span className="text-sm">⋯</span>{othersAfterMeCount} autres participants
          </div>
        )}
         </div>
      <TrendMsg variant="stable" icon={<FaChartLine className="text-[#08316e]" />}>
        {distanceToTop > 0
          ? <><strong>Vous êtes à {distanceToTop} points du 1er.</strong> Continuez vos efforts pour grimper dans le classement.</>
          : <><strong>Vous menez le classement !</strong> Maintenez votre avance cette semaine.</>}
      </TrendMsg>
    </Card>
  );
}

export default CardClassement;
