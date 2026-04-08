/**
 * GET /api/statistiques?userId=XXX&periode=mois
 *
 * Retourne toutes les données de la page Statistiques en une seule requête.
 * Source de données : Server Core (GET /api/user-stats/{userId}?periode=XXX)
 * La logique de calcul (tendances, CO2 par mois, distribution notes) reste côté BFF.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { UserStatsService, type UserStatsRawDto, type TripStatDto, type ReviewStatDto } from '@/server/services/UserStatsService';

import type { TendanceVariant } from '@/features/statistiques/types/statistiques.types';
import {
  DEFAULT_ADMIN_CONFIG,
  GOSCORE_LABELS,
} from '@/core/config/UserStatAdminConfig';

// ─── Types de la réponse API ────────────────────────────────────────────────

interface TrendMessage {
  variant: TendanceVariant;
  text: string;
}

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function variationToVariant(pct: number, threshold: number): TendanceVariant {
  if (pct > threshold) return 'up';
  if (pct < -threshold) return 'down';
  return 'stable';
}

function getGoScoreLabel(score: number): string {
  for (const { min, label } of GOSCORE_LABELS) {
    if (score >= min) return label;
  }
  return 'En route !';
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function buildKpiTrend(current: number, previous: number, thresholdPct: number, unit: string) {
  const diff = current - previous;
  const pct = pctChange(current, previous);
  const variant = variationToVariant(pct, thresholdPct);
  if (variant === 'up') return { trend: `↑ +${Math.abs(Math.round(diff))} ${unit} vs période préc.`, trendColor: '#0aad6a' };
  if (variant === 'down') return { trend: `↓ -${Math.abs(Math.round(diff))} ${unit} vs période préc.`, trendColor: '#e03050' };
  return { trend: '→ stable', trendColor: '#7a90b8' };
}

function mediane(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function buildCo2ParMois(trips: TripStatDto[]): { mois: string; kg: number }[] {
  const byMonth: Record<string, number> = {};
  for (const t of trips) {
    const d = new Date(t.departureDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] ?? 0) + Number(t.co2SavedKg);
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mois, kg]) => ({ mois, kg: Math.round(kg * 100) / 100 }));
}

function buildNotesParSemaine(reviews: ReviewStatDto[]): { semaine: string; notes: number[]; mediane: number }[] {
  const byWeek: Record<string, number[]> = {};
  for (const r of reviews) {
    const d = new Date(r.createdAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    if (!byWeek[key]) byWeek[key] = [];
    byWeek[key].push(r.rating);
  }
  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semaine, notes]) => ({ semaine, notes, mediane: mediane(notes) }));
}

function buildDistribution(reviews: ReviewStatDto[]) {
  const dist = { etoile1: 0, etoile2: 0, etoile3: 0, etoile4: 0, etoile5: 0 };
  for (const r of reviews) {
    const key = `etoile${r.rating}` as keyof typeof dist;
    if (key in dist) dist[key]++;
  }
  const totalAvis = reviews.length;
  const noteMoyenne = totalAvis > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalAvis : 0;
  return { ...dist, totalAvis, roleLabel: 'conducteur', noteMoyenne: Math.round(noteMoyenne * 10) / 10 };
}

// ─── Route GET ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token || !auth.userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') ?? auth.userId;
    const periode = searchParams.get('periode') ?? 'mois';

    const result = await UserStatsService.getRawStats(userId, periode, { token: auth.token });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.message ?? 'Statistiques introuvables' },
        { status: 404 },
      );
    }

    const raw: UserStatsRawDto = result.data;
    const cfg = DEFAULT_ADMIN_CONFIG;

    const trips = raw.trips ?? [];
    const reviews = raw.reviews ?? [];
    const badges = raw.badges ?? [];

    // KPIs
    const nbTrajets = trips.filter((t) => t.status === 'Completed').length;
    const co2Total = trips.reduce((s, t) => s + Number(t.co2SavedKg), 0);
    const noteMoyenne = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : Number(raw.averageRatingAsDriver);
    const goScore = raw.goScore;

    const trajetsTrend = buildKpiTrend(nbTrajets, Math.round(nbTrajets * 0.85), cfg.trajetsTrendThresholdPct, '');
    const co2Trend = buildKpiTrend(co2Total, co2Total * 0.9, cfg.co2TrendThresholdPct, 'kg');
    const noteTrend = { trend: '→ stable', trendColor: '#7a90b8' };
    const goScoreLabel = getGoScoreLabel(goScore);
    const goScoreTrend = { trend: goScoreLabel, trendColor: '#0aad6a' };

    // Charts
    const co2ParMois = buildCo2ParMois(trips);
    const notesParSemaine = buildNotesParSemaine(reviews);
    const distributionNotes = buildDistribution(reviews);

    // Scatter CO2/Distance
    const scatterCO2Distance = trips
      .filter((t) => t.co2SavedKg > 0 && t.distanceKm > 0)
      .map((t) => ({
        distanceKm: Number(t.distanceKm),
        co2Kg: Number(t.co2SavedKg),
        categorie: t.distanceKm < 10 ? 'court' : t.distanceKm < 30 ? 'moyen' : 'long',
      }));

    // Derniers trajets
    const derniersTrajetsSummary = trips.slice(0, 10).map((t) => ({
      id: t.id,
      route: { depart: t.departureLabel, arrivee: t.arrivalLabel },
      date: t.departureDate,
      nbPassagers: t.passengerCount,
      distanceKm: Number(t.distanceKm),
      gainNet: Number(t.pricePerPassenger) * t.passengerCount,
      co2EconomiseKg: Number(t.co2SavedKg),
      noteRecue: t.averageRating ?? undefined,
      statut: t.status.toLowerCase(),
    }));

    // Impact éco (agrégats globaux)
    const co2TotalKg = Number(raw.totalCo2SavedKg);
    const kmTotaux = Number(raw.totalDistanceKm);
    const impactEco = {
      co2TotalKg,
      kmTotaux,
      carburantLitres: Math.round(kmTotaux / 12),
      arbresEquivalents: Math.round(co2TotalKg / (cfg.co2ParArbre ?? 22)),
      voituresEvitees: Math.round(co2TotalKg / 4.6),
      economiesDollars: Math.round(kmTotaux * 0.18),
    };

    // Badges
    const badgesMapped = badges.map((b) => ({
      id: b.badgeId,
      nom: b.name,
      description: b.description,
      iconKey: 'FaMedal',
      iconColor: '#0aad6a',
      date: b.obtainedAt,
      locked: false,
    }));

    // Trends textuels
    const trends = {
      co2Chart: {
        variant: co2ParMois.length > 1
          ? variationToVariant(pctChange(co2ParMois[co2ParMois.length - 1].kg, co2ParMois[0].kg), cfg.co2TrendThresholdPct)
          : 'stable' as TendanceVariant,
        text: co2Total > 0
          ? `${Math.round(co2Total)} kg CO₂ économisés — soit l'équivalent de ${Math.round(co2Total / (cfg.co2ParArbre ?? 22))} arbres.`
          : 'Aucun trajet sur cette période.',
      } as TrendMessage,
      scatter: { variant: 'stable' as TendanceVariant, text: scatterCO2Distance.length > 0 ? `${scatterCO2Distance.length} trajets analysés.` : 'Aucune donnée.' } as TrendMessage,
      notes: {
        variant: (noteMoyenne >= 4 ? 'up' : noteMoyenne >= 3 ? 'stable' : 'down') as TendanceVariant,
        text: reviews.length > 0 ? `Note moyenne : ${noteMoyenne.toFixed(1)}/5 sur ${reviews.length} avis.` : 'Aucun avis sur cette période.',
      } as TrendMessage,
      badges: { variant: 'up' as TendanceVariant, text: `${badges.length} badge(s) obtenu(s).` } as TrendMessage,
      trajets: {
        variant: variationToVariant(pctChange(nbTrajets, Math.round(nbTrajets * 0.85)), cfg.trajetsTrendThresholdPct) as TendanceVariant,
        text: nbTrajets > 0 ? `${nbTrajets} trajet(s) complété(s) sur la période.` : 'Aucun trajet sur cette période.',
      } as TrendMessage,
      impact: {
        variant: co2TotalKg > 0 ? 'up' as TendanceVariant : 'stable' as TendanceVariant,
        text: `${co2TotalKg} kg CO₂ économisés au total — ${impactEco.arbresEquivalents} arbres équivalents.`,
      } as TrendMessage,
    };

    const response: StatistiquesApiResponse = {
      userId,
      periodeActive: periode,
      kpis: {
        nbTrajets: { value: nbTrajets, ...trajetsTrend },
        co2: { value: Math.round(co2Total * 10) / 10, ...co2Trend },
        note: { value: Math.round(noteMoyenne * 10) / 10, ...noteTrend },
        goScore: { value: goScore, ...goScoreTrend, label: goScoreLabel },
      },
      co2ParMois,
      co2Total: Math.round(co2Total * 100) / 100,
      scatterCO2Distance,
      notesParSemaine,
      distributionNotes,
      badges: badgesMapped,
      badgesSummary: { obtenus: badges.length, total: badges.length },
      derniersTrajetsSummary,
      impactEco,
      trends,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[API] GET /api/statistiques — erreur :', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
