"use client";

/**
 * CardClassement — classement mensuel avec top-3, ellipse et rang de l'utilisateur.
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
  { bg: "linear-gradient(135deg,#08316e,#1a5cb0)", init: "A" },
];
const RANK_COLORS = ["#c8960a", "#8090a8", "#c88030", "#08316e"];
const RANK_ICONS = [<FaTrophy key={0} size={10} className="text-[#c8960a]" />, null, null];

// ─── Composant ──────────────────────────────────────────────────────────────

function CardClassement({ classement }: { classement: EntreeClassement[] }) {
  return (
    <Card delay={200}>
      <CardHeader
        dotColor="#c8960a"
        title="Classement Mensuel"
        right={<span className="text-[#7a90b8] text-[11px]">Mars 2026</span>}
      />
      <div className="px-5 py-3 h-full flex flex-col gap-1.5">
        {/* Top 3 */}
        {classement.filter((e) => !e.estMoi).slice(0, 3).map((e, i) => (
          <div key={e.rang} className="flex items-center gap-2.5 py-2 px-3 rounded-xl">
            <div className="font-[Syne] font-extrabold text-sm w-6 text-center shrink-0" style={{ color: RANK_COLORS[i] }}>
              {e.rang}
            </div>
            <div
              className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white"
              style={{ background: RANK_AVATARS[i].bg }}
            >
              {RANK_AVATARS[i].init}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xs flex items-center gap-1">
                {e.nom} {i === 0 && RANK_ICONS[0]}
              </div>
              <div className="text-[#7a90b8] text-[10px]">{e.score} pts · {e.nbTrajets} trajets · {e.note}★</div>
            </div>
            <div className="font-[Syne] font-extrabold text-xs text-[#08316e]">{e.score}</div>
          </div>
        ))}
        {/* Ellipse */}
        <div className="py-1 px-3 text-[10px] text-[#7a90b8] flex items-center gap-2">
          <span className="text-sm">⋯</span>38 autres conducteurs
        </div>
        {/* Ligne utilisateur courant */}
        {classement.filter((e) => e.estMoi).map((e) => (
          <div
            key={e.rang}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-[rgba(8,49,110,0.13)] border border-[rgba(8,49,110,0.2)]"
          >
            <div className="font-[Syne] font-extrabold text-sm w-6 text-center shrink-0 text-[#08316e]">{e.rang}</div>
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-white"
              style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
            >
              A
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xs">Ahmed I. <span className="text-[9px] text-[#08316e] font-bold">(Vous)</span></div>
              <div className="text-[#7a90b8] text-[10px]">{e.score} pts · {e.nbTrajets} trajets · {e.note}★</div>
            </div>
            <div className="font-[Syne] font-extrabold text-xs text-[#08316e]">{e.score}</div>
          </div>
        ))}
      </div>
      <TrendMsg variant="stable" icon={<FaChartLine className="text-[#08316e]" />}>
        <strong>Vous êtes à 75 points du Top 25.</strong>{" "}
        Marie-Claude L. mène avec 980 pts — un rythme de 3 trajets/jour sur 5 jours vous permettrait de combler l&apos;écart.
      </TrendMsg>
    </Card>
  );
}

export default CardClassement;
