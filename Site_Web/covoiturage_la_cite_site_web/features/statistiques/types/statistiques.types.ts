/**
 * Types de la feature Statistiques.
 * KPIs, CO2, notes, badges, trajets récents et impact écologique.
 * Alignés sur la réponse de GET /api/statistiques.
 */

// ─── Période ─────────────────────────────────────────────────────────────────

export type Periode = "7j" | "mois" | "3mois" | "6mois" | "tout";

// ─── Tendance ────────────────────────────────────────────────────────────────

export type TendanceVariant = "up" | "down" | "stable" | "warn";

// ─── Message de tendance (généré par le backend) ─────────────────────────────

export interface TrendMessage {
  variant: TendanceVariant;
  text: string;
}

// ─── Trajet Résumé ───────────────────────────────────────────────────────────

export interface TrajetResume {
  id: string;
  route: { depart: string; arrivee: string };
  date: string;
  nbPassagers: number;
  distanceKm: number;
  gainNet: number;
  co2EconomiseKg: number;
  noteRecue?: number;
  statut: "complete" | "annule";
}

// ─── Data Points ─────────────────────────────────────────────────────────────

export interface DataPointCO2Distance {
  distanceKm: number;
  co2Kg: number;
  categorie: "courte" | "moyenne" | "longue";
}

export interface DonneesNotesHebdo {
  semaine: string;
  notes: number[];
  mediane: number;
}

export interface CO2Mois {
  mois: string;
  kg: number;
  isFutur?: boolean;
}

// ─── Impact Écologique ───────────────────────────────────────────────────────

export interface ImpactEco {
  co2TotalKg: number;
  kmTotaux: number;
  carburantLitres: number;
  arbresEquivalents: number;
  voituresEvitees: number;
  economiesDollars: number;
}

// ─── Badge enrichi (assemblé par le backend) ─────────────────────────────────

export interface BadgeObtenu {
  id: string;
  nom: string;
  description: string;
  iconKey: string;
  iconColor: string;
  date?: string;
  locked?: boolean;
  restant?: string;
}

// ─── Distribution des notes ──────────────────────────────────────────────────

export interface DistributionNotes {
  etoile1: number;
  etoile2: number;
  etoile3: number;
  etoile4: number;
  etoile5: number;
  totalAvis: number;
  roleLabel: string;
  noteMoyenne: number;
}

// ─── KPI avec tendance (généré par le backend) ──────────────────────────────

export interface KpiAvecTendance {
  value: number;
  trend: string;
  trendColor: string;
  label?: string;
}

// ─── KPIs regroupés ──────────────────────────────────────────────────────────

export interface StatistiquesKpis {
  nbTrajets: KpiAvecTendance;
  co2: KpiAvecTendance;
  note: KpiAvecTendance;
  goScore: KpiAvecTendance;
}

// ─── Page Model (= réponse API) ─────────────────────────────────────────────

export interface StatistiquesPageModel {
  userId: string;
  periodeActive: Periode;
  kpis: StatistiquesKpis;
  co2ParMois: CO2Mois[];
  co2Total: number;
  scatterCO2Distance: DataPointCO2Distance[];
  notesParSemaine: DonneesNotesHebdo[];
  distributionNotes: DistributionNotes;
  badges: BadgeObtenu[];
  badgesSummary: { obtenus: number; total: number };
  derniersTrajetsSummary: TrajetResume[];
  impactEco: ImpactEco;
  trends: {
    co2Chart: TrendMessage;
    scatter: TrendMessage;
    notes: TrendMessage;
    badges: TrendMessage;
    trajets: TrendMessage;
    impact: TrendMessage;
  };
}
