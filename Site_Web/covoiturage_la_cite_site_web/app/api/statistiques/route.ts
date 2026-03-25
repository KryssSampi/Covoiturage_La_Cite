/**
 * GET /api/statistiques?userId=XXX&periode=mois
 *
 * Retourne toutes les données de la page Statistiques en une seule requête.
 * Assemble : user_stats + badges + admin config → StatistiquesApiResponse.
 * Le client reçoit directement un objet prêt à l'emploi, aucun montage côté client.
 *
 * Le paramètre `periode` filtre les données par période (7j, mois, 3mois, 6mois, tout).
 * Les messages de tendance sont générés dynamiquement selon les seuils admin.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { BadgeModel } from "@/core/models/BadgeModel";
import type { UserStatModel } from "@/core/models/UserStatModel";
import type { TendanceVariant } from "@/features/statistiques/types/statistiques.types";

import {
  DEFAULT_ADMIN_CONFIG,
  GOSCORE_LABELS,
} from "@/core/config/UserStatAdminConfig";

// ─── Types de la réponse API ────────────────────────────────────────────────

/** Message de tendance généré dynamiquement par le backend */
interface TrendMessage {
  variant: TendanceVariant;
  text: string;
}

/** Réponse complète de l'API */
export interface StatistiquesApiResponse {
  userId: string;
  periodeActive: string;
  kpis: {
    nbTrajets: { value: number; trend: string; trendColor: string };
    co2: { value: number; trend: string; trendColor: string };
    note: { value: number; trend: string; trendColor: string };
    goScore: { value: number; trend: string; trendColor: string; label: string };
  };
  co2ParMois: { mois: string; kg: number; isFutur?: boolean }[];
  co2Total: number;
  scatterCO2Distance: { distanceKm: number; co2Kg: number; categorie: string }[];
  notesParSemaine: { semaine: string; notes: number[]; mediane: number }[];
  distributionNotes: {
    etoile1: number; etoile2: number; etoile3: number; etoile4: number; etoile5: number;
    totalAvis: number; roleLabel: string; noteMoyenne: number;
  };
  badges: {
    id: string; nom: string; description: string; iconKey: string; iconColor: string;
    date?: string; locked: boolean; restant?: string;
  }[];
  badgesSummary: { obtenus: number; total: number };
  derniersTrajetsSummary: {
    id: string; route: { depart: string; arrivee: string }; date: string;
    nbPassagers: number; distanceKm: number; gainNet: number;
    co2EconomiseKg: number; noteRecue?: number; statut: string;
  }[];
  impactEco: {
    co2TotalKg: number; kmTotaux: number; carburantLitres: number;
    arbresEquivalents: number; voituresEvitees: number; economiesDollars: number;
  };
  trends: {
    co2Chart: TrendMessage;
    scatter: TrendMessage;
    notes: TrendMessage;
    badges: TrendMessage;
    trajets: TrendMessage;
    impact: TrendMessage;
  };
}

// ─── Helpers : génération des tendances ─────────────────────────────────────

/** Détermine la variante de tendance à partir d'un pourcentage de variation */
function variationToVariant(pct: number, threshold: number): TendanceVariant {
  if (pct > threshold) return 'up';
  if (pct < -threshold) return 'down';
  return 'stable';
}

/** Génère le label du GoScore selon les seuils admin */
function getGoScoreLabel(score: number): string {
  for (const { min, label } of GOSCORE_LABELS) {
    if (score >= min) return label;
  }
  return 'En route !';
}

/** Calcule le pourcentage de variation entre deux valeurs */
function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Génère un message de tendance pour les KPIs */
function buildKpiTrend(
  current: number,
  previous: number,
  thresholdPct: number,
  unit: string,
): { trend: string; trendColor: string } {
  const diff = current - previous;
  const pct = pctChange(current, previous);
  const variant = variationToVariant(pct, thresholdPct);

  if (variant === 'up') {
    return {
      trend: `↑ +${Math.abs(Math.round(diff))} ${unit} vs période préc.`,
      trendColor: '#0aad6a',
    };
  }
  if (variant === 'down') {
    return {
      trend: `↓ -${Math.abs(Math.round(diff))} ${unit} vs période préc.`,
      trendColor: '#e03050',
    };
  }
  return { trend: '→ stable', trendColor: '#7a90b8' };
}

// ─── Mapping période → période précédente ──────────────────────────────────

const PREV_PERIODE: Record<string, string> = {
  '7j': '7j',
  'mois': '3mois',
  '3mois': '6mois',
  '6mois': 'tout',
  'tout': 'tout',
};

// ─── Route GET ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const periode = searchParams.get('periode') ?? 'mois';

    if (!userId) {
      return NextResponse.json(
        { error: 'Le paramètre userId est requis' },
        { status: 400 },
      );
    }

    // Lecture des données depuis la base JSON
    const allStats = persistenceManager.readAll<UserStatModel>('user_stats');
    const allBadges = persistenceManager.readAll<BadgeModel>('badges');

    const userStat = allStats.find((s) => s.userId === userId);
    if (!userStat) {
      return NextResponse.json(
        { error: `Aucune statistique trouvée pour l'utilisateur ${userId}` },
        { status: 404 },
      );
    }

    const cfg = DEFAULT_ADMIN_CONFIG;
    const prevPeriode = PREV_PERIODE[periode] ?? 'tout';

    // ── KPIs filtrés par période ──────────────────────────────────────────
    const currentKpis = userStat.kpisParPeriode[periode] ?? userStat.kpis;
    const prevKpis = userStat.kpisParPeriode[prevPeriode] ?? userStat.kpis;

    const trajetsTrend = buildKpiTrend(currentKpis.nbTrajets, prevKpis.nbTrajets, cfg.trajetsTrendThresholdPct, '');
    const co2KpiTrend = buildKpiTrend(currentKpis.co2TotalKg, prevKpis.co2TotalKg, cfg.co2TrendThresholdPct, 'kg');

    // Note moyenne : comparaison directe
    const noteDiff = currentKpis.noteMoyenne - prevKpis.noteMoyenne;
    const noteVariant = Math.abs(noteDiff) < cfg.noteTrendThreshold ? 'stable' : noteDiff > 0 ? 'up' : 'down';
    const noteTrend = noteVariant === 'stable'
      ? { trend: '→ stable', trendColor: '#7a90b8' }
      : {
        trend: noteDiff > 0
          ? `↑ +${noteDiff.toFixed(1)} vs période préc.`
          : `↓ ${noteDiff.toFixed(1)} vs période préc.`,
        trendColor: noteDiff > 0 ? '#0aad6a' : '#e03050',
      };

    const goScoreLabel = getGoScoreLabel(currentKpis.goScore);
    const goScoreDiff = currentKpis.goScore - prevKpis.goScore;
    const goScoreTrend = Math.abs(goScoreDiff) < cfg.goScoreTrendThreshold
      ? { trend: goScoreLabel, trendColor: '#0aad6a' }
      : {
        trend: goScoreDiff > 0
          ? `↑ +${goScoreDiff} pts — ${goScoreLabel}`
          : `↓ ${goScoreDiff} pts — ${goScoreLabel}`,
        trendColor: goScoreDiff > 0 ? '#0aad6a' : '#e03050',
      };

    // ── Données filtrées par période ──────────────────────────────────────
    const co2ParMois = userStat.co2ParMoisParPeriode[periode] ?? userStat.co2ParMois;
    const notesParSemaine = userStat.notesParSemaineParPeriode[periode] ?? userStat.notesParSemaine;
    const scatterData = userStat.scatterParPeriode[periode] ?? userStat.scatterCO2Distance;
    const impactEco = userStat.impactEcoParPeriode[periode] ?? userStat.impactEco;
    const trajets = userStat.trajetsParPeriode[periode] ?? userStat.derniersTrajetsSummary;

    // ── CO₂ total pour la période ─────────────────────────────────────────
    const co2Total = co2ParMois.reduce((acc, m) => acc + m.kg, 0);

    // ── Assemblage des badges (user_stats refs + badges DB) ───────────────
    const badgesMap = new Map(allBadges.map((b) => [b.id, b]));
    const badgesObtenus = userStat.badgeRefs.length;
    const badgesVerrouilles = userStat.badgeRefs.filter((r) => r.locked).length;

    const badges = userStat.badgeRefs.map((ref) => {
      const badge = badgesMap.get(ref.badgeId);
      return {
        id: ref.badgeId,
        nom: badge?.nom ?? 'Badge inconnu',
        description: badge?.description ?? '',
        iconKey: badge?.iconKey ?? 'FaMedal',
        iconColor: badge?.iconColor ?? '#7a90b8',
        date: ref.dateObtention,
        locked: ref.locked,
        restant: ref.restant,
      };
    });

    // ── Distribution des notes ────────────────────────────────────────────
    const dist = userStat.distributionNotes;
    const distributionNotes = {
      ...dist,
      noteMoyenne: currentKpis.noteMoyenne,
    };

    // ── Trajets formatés ──────────────────────────────────────────────────
    const derniersTrajetsSummary = trajets.map((t) => ({
      id: t.id,
      route: { depart: t.depart, arrivee: t.arrivee },
      date: t.date,
      nbPassagers: t.nbPassagers,
      distanceKm: t.distanceKm,
      gainNet: t.gainNet,
      co2EconomiseKg: t.co2EconomiseKg,
      noteRecue: t.noteRecue,
      statut: t.statut,
    }));

    // ── Messages de tendance dynamiques ───────────────────────────────────
    const co2PctChange = co2ParMois.length >= 2
      ? pctChange(co2ParMois[co2ParMois.length - 1].kg, co2ParMois[0].kg)
      : 0;

    const trends = {
      co2Chart: {
        variant: variationToVariant(co2PctChange, cfg.co2TrendThresholdPct),
        text: co2PctChange > cfg.co2TrendThresholdPct
          ? `Progression constante : +${Math.round(co2PctChange)}% de CO₂ économisé sur la période. À ce rythme vous atteindrez ${Math.round(co2Total * 1.5)} kg cumulés — soit l'équivalent de ${Math.round(co2Total * 1.5 / cfg.co2ParArbre)} arbres plantés.`
          : co2PctChange < -cfg.co2TrendThresholdPct
            ? `Baisse de ${Math.abs(Math.round(co2PctChange))}% de CO₂ économisé. Essayez d'augmenter vos trajets partagés pour inverser la tendance.`
            : `CO₂ économisé stable sur la période. Continuez vos efforts pour maintenir l'impact.`,
      } as TrendMessage,

      scatter: {
        variant: 'stable' as TendanceVariant,
        text: scatterData.length > 0
          ? `Corrélation forte entre distance et CO₂ économisé. Vos trajets de ${Math.min(...scatterData.map((d) => d.distanceKm))}–${Math.max(...scatterData.map((d) => d.distanceKm))} km sont analysés — priorisez les passagers sur les distances moyennes pour maximiser votre impact.`
          : `Aucune donnée de trajet sur cette période.`,
      } as TrendMessage,

      notes: {
        variant: noteVariant === 'stable' ? 'stable' : noteVariant === 'up' ? 'up' : 'warn',
        text: notesParSemaine.length > 0
          ? (() => {
            const medianes = notesParSemaine.map((n) => n.mediane);
            const max = Math.max(...medianes);
            const weeksAtMax = medianes.filter((m) => m >= max).length;
            return `Vos notes sont globalement ${currentKpis.noteMoyenne >= 4 ? 'excellentes' : currentKpis.noteMoyenne >= 3 ? 'bonnes' : 'à améliorer'} avec une médiane à ${max}☆ sur ${weeksAtMax} des ${notesParSemaine.length} dernières semaines.`;
          })()
          : `Aucun avis reçu sur cette période.`,
      } as TrendMessage,

      badges: {
        variant: badgesObtenus - badgesVerrouilles > 0 ? 'up' : 'stable',
        text: (() => {
          const obtenus = badgesObtenus - badgesVerrouilles;
          const prochainLocked = userStat.badgeRefs.find((r) => r.locked);
          const prochainBadge = prochainLocked ? badgesMap.get(prochainLocked.badgeId) : null;
          return prochainBadge
            ? `${obtenus} badges obtenus. Votre prochain badge "${prochainBadge.nom}" nécessite ${prochainLocked?.restant ?? 'des efforts supplémentaires'}.`
            : `${obtenus} badges obtenus — félicitations !`;
        })(),
      } as TrendMessage,

      trajets: {
        variant: variationToVariant(
          pctChange(currentKpis.nbTrajets, prevKpis.nbTrajets),
          cfg.trajetsTrendThresholdPct,
        ),
        text: (() => {
          const reussis = derniersTrajetsSummary.filter((t) => t.statut === 'complete').length;
          const total = derniersTrajetsSummary.length;
          if (total === 0) return 'Aucun trajet sur cette période.';
          const meilleur = derniersTrajetsSummary
            .filter((t) => t.statut === 'complete')
            .sort((a, b) => b.gainNet - a.gainNet)[0];
          return meilleur
            ? `${reussis} trajets réussis sur ${total} récents. Votre meilleur trajet (${meilleur.route.depart} → ${meilleur.route.arrivee}) a généré ${meilleur.gainNet} $ et économisé ${meilleur.co2EconomiseKg} kg de CO₂.`
            : `${reussis} trajets réussis sur ${total} récents.`;
        })(),
      } as TrendMessage,

      impact: {
        variant: impactEco.co2TotalKg > 0 ? 'up' : 'stable',
        text: `${impactEco.co2TotalKg} kg CO₂ économisés sur la période — l'équivalent de ${impactEco.arbresEquivalents} arbres plantés ou ${impactEco.voituresEvitees} voitures maintenues au garage pour une journée.`,
      } as TrendMessage,
    };

    // ── Réponse assemblée ─────────────────────────────────────────────────
    const response: StatistiquesApiResponse = {
      userId: userStat.userId,
      periodeActive: periode,
      kpis: {
        nbTrajets: { value: currentKpis.nbTrajets, ...trajetsTrend },
        co2: { value: currentKpis.co2TotalKg, ...co2KpiTrend },
        note: { value: currentKpis.noteMoyenne, ...noteTrend },
        goScore: { value: currentKpis.goScore, ...goScoreTrend, label: goScoreLabel },
      },
      co2ParMois,
      co2Total,
      scatterCO2Distance: scatterData,
      notesParSemaine,
      distributionNotes,
      badges,
      badgesSummary: {
        obtenus: badgesObtenus - badgesVerrouilles,
        total: allBadges.length,
      },
      derniersTrajetsSummary,
      impactEco,
      trends,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] GET /api/statistiques — erreur :', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 },
    );
  }
}
