/**
 * UserStatModel — Statistiques pré-calculées pour un utilisateur.
 *
 * Stocké en DB JSON (tests/db/user_stats.json).
 * Contient TOUTES les données nécessaires pour alimenter la page Statistiques.
 * Le backend assemble ce modèle + BadgeModel[] pour produire le StatistiquesPageModel final.
 */

import type { BadgeIconKey } from './BadgeModel';

// ─── Sous-types ──────────────────────────────────────────────────────────────

/** KPIs principaux de la page */
export interface UserStatKpis {
  nbTrajets: number;
  co2TotalKg: number;
  noteMoyenne: number;
  goScore: number;
}

/** Ventilation conducteur/passager */
export interface UserStatTrajets {
  conducteur: number;
  passager: number;
  totalKm: number;
  dureeMoyenneMin: number;
  annulations: number;
  ponctualite: number;
  passagersUniques: number;
  gainNet: number;
}

/** Données CO₂ par mois */
export interface UserStatCO2Mois {
  mois: string;
  kg: number;
  isFutur?: boolean;
}

/** Point de dispersion CO₂ × distance */
export interface UserStatScatterPoint {
  distanceKm: number;
  co2Kg: number;
  categorie: 'courte' | 'moyenne' | 'longue';
}

/** Notes reçues par semaine */
export interface UserStatNotesHebdo {
  semaine: string;
  notes: number[];
  mediane: number;
}

/** Distribution des notes (index 0=1★, ..., 5=5★) — 6 éléments [0★ jamais utilisé, 1★..5★] */
export interface UserStatDistributionNotes {
  etoile1: number;
  etoile2: number;
  etoile3: number;
  etoile4: number;
  etoile5: number;
  totalAvis: number;
  roleLabel: string;
}

/** Résumé d'un trajet récent */
export interface UserStatTrajetResume {
  id: string;
  depart: string;
  arrivee: string;
  date: string;
  nbPassagers: number;
  distanceKm: number;
  gainNet: number;
  co2EconomiseKg: number;
  noteRecue?: number;
  statut: 'complete' | 'annule';
}

/** Impact écologique global */
export interface UserStatImpactEco {
  co2TotalKg: number;
  kmTotaux: number;
  carburantLitres: number;
  arbresEquivalents: number;
  voituresEvitees: number;
  economiesDollars: number;
}

/** Badge obtenu ou verrouillé dans le contexte utilisateur */
export interface UserStatBadgeRef {
  badgeId: string;
  dateObtention?: string;
  locked: boolean;
  restant?: string;
}

// ─── Modèle principal ────────────────────────────────────────────────────────

export interface UserStatModel {
  /** Identifiant unique du stat, ex: "stat-USR-2026-00001" */
  id: string;
  /** ID de l'utilisateur propriétaire */
  userId: string;
  /** Date de dernière mise à jour des stats */
  updatedAt: string;

  // ── Données globales (période "tout") ─────────────────────────────────
  kpis: UserStatKpis;
  statsTrajets: UserStatTrajets;
  co2ParMois: UserStatCO2Mois[];
  scatterCO2Distance: UserStatScatterPoint[];
  notesParSemaine: UserStatNotesHebdo[];
  distributionNotes: UserStatDistributionNotes;
  badgeRefs: UserStatBadgeRef[];
  derniersTrajetsSummary: UserStatTrajetResume[];
  impactEco: UserStatImpactEco;

  // ── Données par période (pour le toggle fonctionnel) ───────────────────
  /** KPIs filtrés par période — clé = Periode */
  kpisParPeriode: Record<string, UserStatKpis>;
  /** CO₂ par mois filtré selon la période */
  co2ParMoisParPeriode: Record<string, UserStatCO2Mois[]>;
  /** Notes par semaine filtrées selon la période */
  notesParSemaineParPeriode: Record<string, UserStatNotesHebdo[]>;
  /** Scatter filtré selon la période */
  scatterParPeriode: Record<string, UserStatScatterPoint[]>;
  /** Impact éco filtré selon la période */
  impactEcoParPeriode: Record<string, UserStatImpactEco>;
  /** Derniers trajets filtrés selon la période */
  trajetsParPeriode: Record<string, UserStatTrajetResume[]>;
}
