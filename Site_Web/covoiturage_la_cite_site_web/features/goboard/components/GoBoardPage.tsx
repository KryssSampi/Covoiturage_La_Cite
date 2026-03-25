"use client";

/**
 * Page Go! Board — GoScore, progression, missions, classement et défis.
 * Composant de présentation pure : toutes les données viennent des props.
 */

import { FaChartLine, FaArrowLeft } from "react-icons/fa6";
import { useZoom } from "@/shared/hooks/useScrollReveal";
import FeatureHeader from "@/shared/components/FeatureHeader";
import type { GoBoardApiResponse } from "@/features/goboard/types/goboard.types";

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

// ─────────────────────────────────────────────────────────────────────────────

interface GoBoardPageProps {
  data: GoBoardApiResponse;
}

export default function GoBoardPage({ data }: GoBoardPageProps) {
  const {
    goScore, tier, rang,
    pointsGagnes, pointsPerdus,
    goTasks, classement, defisEco, goEvents,
  } = data;

  const { scale: scatterScale, zoomIn: ziS, zoomOut: zoS, reset: rstS, containerRef: scatterRef } = useZoom();

  const netPoints = pointsGagnes + pointsPerdus;
  const trendScoreText = netPoints > 0
    ? `+${netPoints} points nets cette semaine.`
    : `${netPoints} points nets cette semaine.`;

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      <FeatureHeader
        breadcrumb="Go! Board"
        title={<><span className="text-[#7dd3fc]">Go!</span> Board</>}
        subtitle="Score de réputation, missions, classement et défis écologiques"
      />

      <div className="flex flex-col gap-4 px-6 md:px-10 py-5">

        {/* Ligne 1 : Dial + Score côte-à-côte */}
        <Card delay={50}>
          <CardHeader
            dotColor="#0aad6a"
            title={<><span className="text-[#0098c8]">Go!</span>&nbsp;Score</>}
            right={<span className="text-[11px] text-[#7a90b8]">Cette semaine</span>}
          />

          {/* Disposition identique à goboard.section.tsx : dial gauche, score droite */}
          <div className="flex items-center justify-between w-full px-2">
            {/* Dial SVG arc — le score est affiché à côté, pas dedans */}
            <div className="flex-shrink-0">
              <DialGoScore score={goScore} tier={tier} rang={rang} />
            </div>

            {/* GoScore + label à droite du dial */}
            <div className="flex flex-col items-center text-center pr-6 gap-1">
              <span className="font-[Syne] font-extrabold text-5xl text-[#08316e] leading-none">
                {goScore}
              </span>
              <p className="text-green-500 text-2xl leading-tight">
                Hyper G
                {(["2xl", "xl", "lg", "[16px]", "sm"] as const).map((size) => (
                  <span key={size} className={`text-${size} text-green-500`}>O</span>
                ))}
                !
              </p>
            </div>
          </div>

          {/* Strip KPI */}
          <div className="grid grid-cols-3 gap-px bg-[rgba(8,49,110,0.09)] border-t border-[rgba(8,49,110,0.09)]">
            {[
              { v: `+${pointsGagnes}`, vc: "#0aad6a", l: "Gagnés cette semaine" },
              { v: `${pointsPerdus}`,   vc: "#e03050", l: "Perdus" },
              { v: `#${rang}`,          vc: "#c8960a", l: "Classement" },
            ].map(({ v, vc, l }) => (
              <div key={l} className="bg-white p-3 text-center">
                <div className="font-[Syne] font-extrabold text-lg" style={{ color: vc }}>{v}</div>
                <div className="text-[9px] text-[#7a90b8] mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          <TrendMsg
            variant={netPoints >= 0 ? "up" : "down"}
            icon={<FaChartLine className={netPoints >= 0 ? "text-[#0aad6a]" : "text-[#e03050]"} />}
          >
            <strong>{trendScoreText}</strong>{" "}
            {rang <= 10
              ? "Vous êtes dans le top 10 — continuez sur cette lancée !"
              : `Vous êtes à la position #${rang} — quelques trajets supplémentaires pourraient vous faire monter.`}
          </TrendMsg>
        </Card>

        {/* Ligne 1b : Scatter progression (données réelles depuis goEvents) */}
        <Card delay={100} className="md:col-span-2">
          <CardHeader
            dotColor="#0098c8"
            title="Progression GoScore (historique)"
            right={<ZoomControls onPlus={ziS} onMinus={zoS} onReset={rstS} />}
          />
          <ScatterProgression
            scale={scatterScale}
            goEvents={goEvents}
            currentScore={goScore}
            containerRef={scatterRef}
          />
        </Card>

        {/* Ligne 2 : Missions (2/3) + Classement (1/3) */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <CardMissions goTasks={goTasks} userId={classement.find((e) => e.estMoi)?.utilisateurId ?? ""} />
          <CardClassement classement={classement} />
        </div>

        {/* Ligne 3 : Défis (1/4) + Historique (3/4) */}
        <div className="grid grid-cols-[1fr_3fr] gap-4">
          <CardDefis defis={defisEco} />
          <CardHistoriquePoints goEvents={goEvents} />
        </div>
      </div>

      <div className="px-6 md:px-10 pb-6">
        <button className="flex items-center gap-2 text-[#08316e] text-xs font-semibold cursor-pointer bg-transparent border-none hover:underline">
          <FaArrowLeft size={10} /> Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}
