/**
 * AffiniteModel — Relation d'affinité entre deux utilisateurs
 *
 * CRÉATION : Automatiquement à la fin du PREMIER trajet partagé.
 *            Même s'ils ne se mettent jamais en favoris, la relation existe.
 *
 * CROISSANCE :
 *   - Trajet complété ensemble       → +1 totalTrajetsEnsemble, score recalculé
 *   - Évaluation positive (≥ 4★)     → affiniteScore monte
 *   - Évaluation négative (< 3★)     → affiniteScore descend
 *   - Mis en favoris manuellement    → isActuallyFavorite = true
 *   - Bloqué manuellement            → isBlocked = true (hard eliminate en matching)
 *   - Signalement soumis             → hadIncident = true, affiniteScore pénalisé
 *
 * BIDIRECTIONNALITÉ : La relation est unidirectionnelle en base.
 * Deux entrées existent si les deux se connaissent.
 *
 * Reflète la table "affinites" en base de données.
 */

// ─── Sous-types ───────────────────────────────────────────────────────────────

export interface AffiniteRatingEvent {
  tripId: string;
  /** Note donnée par userId à targetUserId */
  noteDonnee: number;   // 1.0–5.0
  /** Note reçue de targetUserId */
  noteRecue: number;    // 1.0–5.0
  date: string;         // ISO
}

export type OrigineRelation = 'trajet_commun' | 'favoris_manuel' | 'recommandation';

// ─── Format legacy (compatible avec affinites.json existant) ─────────────────

/**
 * AffiniteRecord — Format simplifié utilisé par le matching v4
 * Compatible avec le format JSON de tests/db/affinites.json
 */
export interface AffiniteRecord {
  idPersonneQuiAMisEnFavoris: string;
  idPersonneEnFavoris: string;
  isActuallyFavorite: boolean;
  /** 0 = neutre/nouveau | 1 = mauvais | 2 = ok | 3 = bien */
  noteAffinite: number;
  totalTrajetsEnsemble: number;
}

// ─── Modèle complet (cible base de données) ───────────────────────────────────

export interface AffiniteModel {

  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  // ── Relations ─────────────────────────────────────────────────────────────
  userId: string;
  targetUserId: string;

  // ── Score d'affinité (0–100) ──────────────────────────────────────────────
  affiniteScore: number;

  // ── Favoris ───────────────────────────────────────────────────────────────
  isActuallyFavorite: boolean;
  favoriteSince?: string;       // ISO

  // ── Historique commun ─────────────────────────────────────────────────────
  totalTrajetsEnsemble: number;
  tripIds: string[];
  premierTrajetDate: string;    // ISO
  dernierTrajetDate: string;    // ISO

  // ── Notes mutuelles ───────────────────────────────────────────────────────
  noteMoyenneDonnee?: number;   // 1.0–5.0
  noteMoyenneRecue?: number;    // 1.0–5.0
  historiqueNotes: AffiniteRatingEvent[];

  // ── Sécurité ──────────────────────────────────────────────────────────────
  isBlocked: boolean;
  blockedAt?: string;           // ISO
  blockedReason?: string;

  // ── Incidents ─────────────────────────────────────────────────────────────
  hadIncident: boolean;
  incidentCount: number;
  hadLitige: boolean;

  // ── Origine ───────────────────────────────────────────────────────────────
  origineRelation: OrigineRelation;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createAffiniteFromFirstTrip(params: {
  userId: string;
  targetUserId: string;
  tripId: string;
  tripDate: string;
}): Omit<AffiniteModel, 'id'> {
  const now = new Date().toISOString();
  return {
    userId:               params.userId,
    targetUserId:         params.targetUserId,
    affiniteScore:        50,
    isActuallyFavorite:   false,
    totalTrajetsEnsemble: 1,
    tripIds:              [params.tripId],
    premierTrajetDate:    params.tripDate,
    dernierTrajetDate:    params.tripDate,
    historiqueNotes:      [],
    isBlocked:            false,
    hadIncident:          false,
    incidentCount:        0,
    hadLitige:            false,
    origineRelation:      'trajet_commun',
    createdAt:            now,
    updatedAt:            now,
  };
}

// ─── Calcul du score ──────────────────────────────────────────────────────────

export function computeAffiniteScore(affinite: AffiniteModel): number {
  let score = 50;
  score += Math.min(affinite.totalTrajetsEnsemble * 5, 25);
  const noteMoy = ((affinite.noteMoyenneDonnee ?? 4) + (affinite.noteMoyenneRecue ?? 4)) / 2;
  score += Math.round(((noteMoy - 1) / 4) * 20);
  if (affinite.isActuallyFavorite) score += 15;
  score -= affinite.incidentCount * 20;
  if (affinite.hadLitige) score -= 10;
  return Math.max(0, Math.min(100, score));
}
