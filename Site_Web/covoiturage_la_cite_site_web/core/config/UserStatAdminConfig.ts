/**
 * UserStatAdminConfig — Seuils de comparaison configurables par l'admin.
 *
 * Ces constantes exportées contrôlent la génération des messages de tendance.
 * Le backend les utilise pour comparer les données entre périodes
 * et produire des messages dynamiques (up/down/stable/warn).
 *
 * Pour modifier un seuil, il suffit de changer la valeur ici — le calcul
 * des tendances se met à jour automatiquement côté API.
 */

// ─── Seuils de variation pour les KPIs ──────────────────────────────────────

/** Pourcentage minimal de variation CO₂ pour qualifier une tendance "up" ou "down" */
export const CO2_TREND_THRESHOLD_PCT = 5;

/** Variation minimale de la note moyenne pour qualifier un changement */
export const NOTE_TREND_THRESHOLD = 0.2;

/** Variation minimale du GoScore pour qualifier un changement */
export const GOSCORE_TREND_THRESHOLD = 20;

/** Variation minimale du nombre de trajets pour qualifier un changement */
export const TRAJETS_TREND_THRESHOLD_PCT = 10;

// ─── Seuils de GoScore pour le label ─────────────────────────────────────────

/** Seuils GoScore → label textuel */
export const GOSCORE_LABELS: { min: number; label: string }[] = [
  { min: 800, label: 'Hyper GOoooo!' },
  { min: 600, label: 'Fast GO!' },
  { min: 400, label: 'GO!' },
  { min: 0,   label: 'En route !' },
];

// ─── Seuils pour les observations du scatter ────────────────────────────────

/** Distance minimale (km) pour catégoriser un trajet "moyenne" */
export const SCATTER_DISTANCE_MOYENNE_KM = 15;

/** Distance minimale (km) pour catégoriser un trajet "longue" */
export const SCATTER_DISTANCE_LONGUE_KM = 40;

// ─── Seuils pour les badges ─────────────────────────────────────────────────

/** Nombre de trajets requis pour le prochain badge de catégorie "trajets" */
export const BADGE_TRAJETS_SEUILS = [6, 21, 51, 101, 200];

// ─── Facteurs de conversion éco ─────────────────────────────────────────────

/** kg de CO₂ par litre de carburant économisé */
export const CO2_PAR_LITRE = 2.3;

/** kg de CO₂ absorbé par un arbre par an */
export const CO2_PAR_ARBRE = 20;

/** kg de CO₂ qu'une voiture émet par jour en moyenne */
export const CO2_PAR_VOITURE_JOUR = 12;

/** Économie en dollars par km covoituré */
export const ECONOMIE_PAR_KM = 0.12;

// ─── Type groupé (pour import unique) ────────────────────────────────────────

export interface UserStatAdminConfig {
  co2TrendThresholdPct: number;
  noteTrendThreshold: number;
  goScoreTrendThreshold: number;
  trajetsTrendThresholdPct: number;
  goScoreLabels: { min: number; label: string }[];
  scatterDistanceMoyenneKm: number;
  scatterDistanceLongueKm: number;
  co2ParLitre: number;
  co2ParArbre: number;
  co2ParVoitureJour: number;
  economieParKm: number;
}

/** Instance par défaut — regroupement de toutes les constantes */
export const DEFAULT_ADMIN_CONFIG: UserStatAdminConfig = {
  co2TrendThresholdPct: CO2_TREND_THRESHOLD_PCT,
  noteTrendThreshold: NOTE_TREND_THRESHOLD,
  goScoreTrendThreshold: GOSCORE_TREND_THRESHOLD,
  trajetsTrendThresholdPct: TRAJETS_TREND_THRESHOLD_PCT,
  goScoreLabels: GOSCORE_LABELS,
  scatterDistanceMoyenneKm: SCATTER_DISTANCE_MOYENNE_KM,
  scatterDistanceLongueKm: SCATTER_DISTANCE_LONGUE_KM,
  co2ParLitre: CO2_PAR_LITRE,
  co2ParArbre: CO2_PAR_ARBRE,
  co2ParVoitureJour: CO2_PAR_VOITURE_JOUR,
  economieParKm: ECONOMIE_PAR_KM,
};
