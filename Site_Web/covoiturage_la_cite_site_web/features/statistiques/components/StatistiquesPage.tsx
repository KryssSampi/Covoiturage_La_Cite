"use client";

/**
 * Page Mes Statistiques - KPIs, graphiques CO2, notes, badges, trajets, impact.
 *
 * Composant de PRESENTATION PURE : recoit toutes les donnees en props.
 * Aucun fetch, aucun useDb - tout est injecte depuis la page route.
 */

import React from "react";
import {
  FaChartLine, FaRuler, FaMedal,
  FaCircleCheck, FaEarthAmericas, FaStar, FaArrowRight,
} from "react-icons/fa6";

import { useZoom } from "@/shared/hooks/useScrollReveal";
import FeatureHeader from "@/shared/components/FeatureHeader";

import type {
  Periode,
  StatistiquesPageModel,
} from "../types/statistiques.types";

// --- Sous-composants UI ---
import Card           from "./ui/Card";
import CardHeader     from "./ui/CardHeader";
import TrendMsg       from "./ui/TrendMsg";
import ZoomControls   from "./ui/ZoomControls";
import PeriodSelector from "./ui/PeriodSelector";

// --- Sous-composants feature ---
import KpiCard            from "./KpiCard";
import CO2BarChart        from "./CO2BarChart";
import CO2DistanceScatter from "./CO2DistanceScatter";
import NotesTimeline      from "./NotesTimeline";
import BadgesGrid         from "./BadgesGrid";
import TripsList          from "./TripsList";
import ImpactEcoSection   from "./ImpactEcoSection";

// --- Props ---

interface StatistiquesPageProps {
  /** Donnees completes assemblees par le backend */
  data: StatistiquesPageModel;
  /** Periode active (etat gere par la page route) */
  periode: Periode;
  /** Callback pour changer la periode (declenche un nouveau fetch) */
  onPeriodeChange: (p: Periode) => void;
  /** Liste des periodes disponibles */
  periodes: Periode[];
}

// --- PAGE PRINCIPALE STATISTIQUES ---

export default function StatistiquesPage({
  data,
  periode,
  onPeriodeChange,
  periodes,
}: StatistiquesPageProps) {
  const { scale: scatterScale, zoomIn: ziS, zoomOut: zoS, reset: rstS, containerRef: scatterRef } = useZoom();

  const { kpis, co2ParMois, co2Total, scatterCO2Distance, notesParSemaine,
    distributionNotes, badges, badgesSummary, derniersTrajetsSummary,
    impactEco, trends } = data;

  return (
    <div className="min-h-screen text-black bg-[#f0f4fb]">
      {/* En-tete */}
      <FeatureHeader
        breadcrumb="Mes Statistiques"
        title="Mes Statistiques"
        subtitle="Votre impact, performances et historique complet"
      >
        <PeriodSelector periodes={periodes} active={periode} onChange={onPeriodeChange} />
      </FeatureHeader>

      {/* KPI Hero - 4 colonnes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-10 pt-5">
        <KpiCard iconKey="trajets" value={String(kpis.nbTrajets.value)} label="Trajets partag&eacute;s" trend={kpis.nbTrajets.trend} trendColor={kpis.nbTrajets.trendColor} delay={50} />
        <KpiCard iconKey="co2" value={String(kpis.co2.value)} unit="kg" label="CO2 economise" trend={kpis.co2.trend} trendColor={kpis.co2.trendColor} delay={100} />
        <KpiCard iconKey="note" value={String(kpis.note.value)} unit="/5" label="Note moyenne" trend={kpis.note.trend} trendColor={kpis.note.trendColor} delay={150} />
        <KpiCard iconKey="score" value={String(kpis.goScore.value)} label="GO! Score" trend={kpis.goScore.trend} trendColor={kpis.goScore.trendColor} delay={200} />
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4 px-6 md:px-10 pt-5 pb-3">

        {/* Histogramme CO2 */}
        <Card delay={200} className="flex flex-col">
          <CardHeader dotColor="#0aad6a" title="CO2 Economise par Mois (Histogramme)" />
          <CO2BarChart data={co2ParMois} co2Total={co2Total} />
          <TrendMsg variant={trends.co2Chart.variant} icon={<FaChartLine className="text-[#0aad6a]" />}>
            {trends.co2Chart.text}
          </TrendMsg>
        </Card>

        {/* Scatter CO2 x Distance */}
        <Card delay={250} className="flex flex-col">
          <CardHeader
            dotColor="#0098c8"
            title="CO2 Economise - Distance"
            right={<ZoomControls onPlus={ziS} onMinus={zoS} onReset={rstS} />}
          />
          <CO2DistanceScatter data={scatterCO2Distance} scale={scatterScale} containerRef={scatterRef} />
          <TrendMsg variant={trends.scatter.variant} icon={<FaRuler className="text-[#08316e]" />}>
            {trends.scatter.text}
          </TrendMsg>
        </Card>

        {/* Notes Timeline */}
        <Card delay={300} className="flex flex-col">
          <CardHeader dotColor="#c8960a" title="Histogramme Temporel des Notes" />
          <NotesTimeline data={notesParSemaine} distribution={distributionNotes} />
          <TrendMsg variant={trends.notes.variant} icon={<FaStar className="text-[#c8960a]" />}>
            {trends.notes.text}
          </TrendMsg>
        </Card>

        {/* Badges */}
        <Card delay={350} className="flex flex-col">
          <CardHeader
            dotColor="#c8960a"
            title="Badges & Recompenses"
            right={<span className="text-[11px] text-[#7a90b8]">{badgesSummary.obtenus} / {badgesSummary.total} badges</span>}
          />
          <BadgesGrid badges={badges} />
          <TrendMsg variant={trends.badges.variant} icon={<FaMedal className="text-[#c8960a]" />}>
            {trends.badges.text}
          </TrendMsg>
        </Card>

        {/* Derniers Trajets - pleine largeur */}
        <Card delay={400} className="md:col-span-2 flex flex-col">
          <CardHeader
            dotColor="#08316e"
            title="Derniers Trajets"
            right={
              <span className="text-[#08316e] text-[11px] cursor-pointer font-semibold flex items-center gap-1">
                Voir l&apos;historique <FaArrowRight size={9} />
              </span>
            }
          />
          <TripsList trips={derniersTrajetsSummary} />
          <TrendMsg variant={trends.trajets.variant} icon={<FaCircleCheck className="text-[#0aad6a]" />}>
            {trends.trajets.text}
          </TrendMsg>
        </Card>

        {/* Impact Ecologique - pleine largeur */}
        <Card delay={450} className="md:col-span-2 flex flex-col">
          <CardHeader
            dotColor="#0aad6a"
            title="Impact Ecologique Global"
          />
          <ImpactEcoSection impact={impactEco} />
          <TrendMsg variant={trends.impact.variant} icon={<FaEarthAmericas className="text-[#0aad6a]" />}>
            {trends.impact.text}
          </TrendMsg>
        </Card>
      </div>
    </div>
  );
}