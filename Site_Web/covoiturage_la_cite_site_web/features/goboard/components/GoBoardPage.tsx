"use client";

/**
 * Page Go! Board — GoScore, progression, missions, classement et défis.
 * Les sous-composants sont importés depuis ./components/.
 */

import React from "react";
import { FaChartLine, FaArrowLeft } from "react-icons/fa6";
import { useZoom } from "@/shared/hooks/useScrollReveal";
import FeatureHeader from "@/shared/components/FeatureHeader";
import { useGoBoard } from "@/features/goboard/hooks/useGoBoard";

// ─── Sous-composants UI ──────────────────────────────────────────────────────
import Card         from "./ui/Card";
import CardHeader   from "./ui/CardHeader";
import TrendMsg     from "./ui/TrendMsg";
import ZoomControls from "./ui/ZoomControls";

// ─── Sous-composants feature ─────────────────────────────────────────────────
import DialGoScore          from "./DialGoScore";
import ScatterProgression   from "./ScatterProgression";
import CardMissions         from "./CardMissions";
import CardClassement       from "./CardClassement";
import CardDefis            from "./CardDefis";
import CardHistoriquePoints from "./CardHistoriquePoints";

// â•â•â•â•••••â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PAGE PRINCIPALE GO! BOARD
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function GoBoardPage() {
  const {
    goScore, tier, rang,
    pointsGagnes, pointsPerdus,
    missions, classement, defisEco, historiquePts,
  } = useGoBoard();

  const { scale: scatterScale, zoomIn: ziS, zoomOut: zoS, reset: rstS } = useZoom();

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      <FeatureHeader
        breadcrumb="Go! Board"
        title={<><span className="text-[#7dd3fc]">Go!</span> Board</>}
        subtitle="Score de réputation, missions, classement et défis écologiques"
      />

      <div className="flex flex-col gap-4 px-6 md:px-10 py-5">

        {/* Ligne 1 : Dial (1col) + Scatter (2col) */}
        <Card delay={50}>
          <CardHeader dotColor="#0aad6a"
            title={<><span className="text-[#0098c8]">Go!</span>&nbsp;Score</>}
            right={<span className="text-[11px] text-[#7a90b8]">Mars 2026</span>} />
          <DialGoScore score={goScore} tier={tier} rang={rang} />
          {/* Strip KPI */}
          <div className="grid grid-cols-3 gap-px bg-[rgba(8,49,110,0.09)] border-t border-[rgba(8,49,110,0.09)]">
            {[
              { v: `+${pointsGagnes}`, vc: "#0aad6a", l: "Gagnés ce mois" },
              { v: `${pointsPerdus}`,   vc: "#e03050", l: "Perdus" },
              { v: `#${rang}`,          vc: "#c8960a", l: "Classement" },
            ].map(({ v, vc, l }) => (
              <div key={l} className="bg-white p-3 text-center">
                <div className="font-[Syne] font-extrabold text-lg" style={{ color: vc }}>{v}</div>
                <div className="text-[9px] text-[#7a90b8] mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <TrendMsg variant="up" icon={<FaChartLine className="text-[#0aad6a]" />}>
            <strong>+225 points nets ce mois.</strong>{" "}
            Votre score est en hausse régulière — vous avez grimpé de 15 positions depuis février.
          </TrendMsg>
        </Card>

        <Card delay={100} className="md:col-span-2">
          <CardHeader dotColor="#0098c8"
            title="Progression GoScore (30 derniers jours)"
            right={<ZoomControls onPlus={ziS} onMinus={zoS} onReset={rstS} />} />
          <ScatterProgression scale={scatterScale} />
        </Card>

        {/* Ligne 2 : Missions (2/3) + Classement (1/3) — hauteur identique */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <CardMissions missions={missions} />
          <CardClassement classement={classement} />
        </div>

        {/* Ligne 3 : Défis (1/4) + Historique (3/4) — hauteur identique */}
        <div className="grid grid-cols-[1fr_3fr] gap-4">
          <CardDefis defis={defisEco} />
          <CardHistoriquePoints historique={historiquePts} />
        </div>
      </div>

      {/* Lien retour */}
      <div className="px-6 md:px-10 pb-6">
        <button className="flex items-center gap-2 text-[#08316e] text-xs font-semibold cursor-pointer bg-transparent border-none hover:underline">
          <FaArrowLeft size={10} /> Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}