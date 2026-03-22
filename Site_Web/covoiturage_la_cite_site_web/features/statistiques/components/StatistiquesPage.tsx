"use client";

/**
 * Page Mes Statistiques â€” KPIs, graphiques COâ‚‚, notes, badges, trajets, impact.
 * Les sous-composants sont importÃ©s depuis ./components/.
 */

import React from "react";
import {
  FaChartLine, FaRuler, FaMedal,
  FaCircleCheck, FaEarthAmericas, FaStar, FaArrowRight,
} from "react-icons/fa6";

import { useZoom } from "@/shared/hooks/useScrollReveal";
import FeatureHeader from "@/shared/components/FeatureHeader";
import { useStatistiques } from "../hooks/useStatistiques";

// â”€â”€â”€ Sous-composants UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import Card        from "./ui/Card";
import CardHeader  from "./ui/CardHeader";
import TrendMsg    from "./ui/TrendMsg";
import ZoomControls  from "./ui/ZoomControls";
import PeriodSelector from "./ui/PeriodSelector";

// â”€â”€â”€ Sous-composants feature â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import KpiCard             from "./KpiCard";
import CO2BarChart         from "./CO2BarChart";
import CO2DistanceScatter  from "./CO2DistanceScatter";
import NotesTimeline       from "./NotesTimeline";
import BadgesGrid          from "./BadgesGrid";
import TripsList           from "./TripsList";
import ImpactEcoSection    from "./ImpactEcoSection";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PAGE PRINCIPALE STATISTIQUES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function StatistiquesPage() {
  const {
    periode, setPeriode, periodes,
    co2ParMois, scatterCO2Distance,
    notesParSemaine, badgesObtenus, derniersTrajetsSummary, impactEco,
  } = useStatistiques();

  const { scale: scatterScale, zoomIn: ziS, zoomOut: zoS, reset: rstS } = useZoom();

  return (
    <div className="min-h-screen text-black bg-[#f0f4fb]">
      {/* En-tÃªte */}
      <FeatureHeader
        breadcrumb="Mes Statistiques"
        title="Mes Statistiques"
        subtitle="Votre impact, performances et historique complet"
      >
        <PeriodSelector periodes={periodes} active={periode} onChange={setPeriode} />
      </FeatureHeader>

      {/* KPI Hero — 4 colonnes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-10 pt-5">
        <KpiCard iconKey="trajets" value="32"    label="Trajets partagés"       trend="↑ +8 vs mois précédent" trendColor="#0aad6a" delay={50} />
        <KpiCard iconKey="co2"     value="234.5" unit="kg" label="CO₂ économisé ce mois" trend="↑ +18% vs fév."       trendColor="#0aad6a" delay={100} />
        <KpiCard iconKey="note"    value="4.2"   unit="/5" label="Note moyenne"           trend="→ stable"              trendColor="#7a90b8" delay={150} />
        <KpiCard iconKey="score"   value="820"   label="GO! Score"              trend="Hyper GOoooo!"         trendColor="#0aad6a" delay={200} />
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4 px-6 md:px-10 pt-5 pb-3">

        {/* Histogramme CO₂ */}
        <Card delay={200}>
          <CardHeader dotColor="#0aad6a" title="CO₂ Économisé par Mois (Histogramme)" />
          <CO2BarChart data={co2ParMois} />
          <TrendMsg variant="up" icon={<FaChartLine className="text-[#0aad6a]" />}>
            <strong>Progression constante : +83% de CO₂ économisé depuis janvier.</strong>{" "}
            À ce rythme vous atteindrez 800 kg cumulés d&apos;ici fin mai — soit l&apos;équivalent de 45 arbres plantés.
          </TrendMsg>
        </Card>

        {/* Scatter CO₂ × Distance */}
        <Card delay={250}>
          <CardHeader
            dotColor="#0098c8"
            title="CO₂ Économisé — Distance"
            right={<ZoomControls onPlus={ziS} onMinus={zoS} onReset={rstS} />}
          />
          <CO2DistanceScatter data={scatterCO2Distance} scale={scatterScale} />
          <TrendMsg variant="stable" icon={<FaRuler className="text-[#08316e]" />}>
            <strong>Corrélation forte entre distance et CO₂ économisé.</strong>{" "}
            Vos trajets de 15–23 km sont les plus impactants — priorisez les passagers sur ces distances pour maximiser votre impact.
          </TrendMsg>
        </Card>

        {/* Notes Timeline */}
        <Card delay={300}>
          <CardHeader dotColor="#c8960a" title="Histogramme Temporel des Notes" />
          <NotesTimeline data={notesParSemaine} />
          <TrendMsg variant="up" icon={<FaStar className="text-[#c8960a]" />}>
            <strong>Vos notes sont globalement excellentes</strong> avec une médiane à 5☆ sur 4 des 7 dernières semaines.
          </TrendMsg>
        </Card>

        {/* Badges */}
        <Card delay={350}>
          <CardHeader
            dotColor="#c8960a"
            title="Badges & Récompenses"
            right={<span className="text-[11px] text-[#7a90b8]">7 / 20 badges</span>}
          />
          <BadgesGrid badges={badgesObtenus} />
          <TrendMsg variant="up" icon={<FaMedal className="text-[#c8960a]" />}>
            <strong>7 badges obtenus en 5 mois.</strong> Votre prochain badge &quot;Expert&quot; nécessite 19 trajets supplémentaires.
          </TrendMsg>
        </Card>

        {/* Derniers Trajets — pleine largeur */}
        <Card delay={400} className="md:col-span-2">
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
          <TrendMsg variant="up" icon={<FaCircleCheck className="text-[#0aad6a]" />}>
            <strong>4 trajets réussis sur 5 récents.</strong> Votre trajet du 12 mars avec 2 passagers a généré 34 $ et économisé 12.6 kg de CO₂.
          </TrendMsg>
        </Card>

        {/* Impact Écologique — pleine largeur */}
        <Card delay={450} className="md:col-span-2">
          <CardHeader
            dotColor="#0aad6a"
            title="Impact Écologique Global"
            right={<span className="text-[11px] text-[#7a90b8]">Depuis oct. 2025</span>}
          />
          <ImpactEcoSection impact={impactEco} />
          <TrendMsg variant="up" icon={<FaEarthAmericas className="text-[#0aad6a]" />}>
            <strong>557.5 kg CO₂ économisés en 5 mois</strong> — l&apos;équivalent de 28 arbres plantés ou 47 voitures maintenues au garage pour une journée.
          </TrendMsg>
        </Card>
      </div>
    </div>
  );
}