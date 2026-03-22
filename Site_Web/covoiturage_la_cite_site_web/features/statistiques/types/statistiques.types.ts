/**
 * Types de la feature Statistiques.
 * KPIs, CO2, notes, badges, trajets récents et impact écologique.
 */

// ─── Période ─────────────────────────────────────────────────────────────────

export type Periode = "7j" | "mois" | "3mois" | "6mois" | "tout";

// ─── Tendance ────────────────────────────────────────────────────────────────

export type TendanceVariant = "up" | "down" | "stable" | "warn";

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

// ─── Badge ───────────────────────────────────────────────────────────────────

export interface BadgeObtenu {
  id: string;
  nom: string;
  description: string;
  date?: string;
  locked?: boolean;
  restant?: string;
}

// ─── Page Model ──────────────────────────────────────────────────────────────

export interface StatistiquesKpis {
  nbTrajets: number;
  co2Mois: number;
  noteMoyenne: number;
  goScore: number;
}

export interface StatistiquesPageModel {
  utilisateurId: string;
  periodeActive: Periode;
  kpis: StatistiquesKpis;
  statsTrajets: {
    conducteur: number;
    passager: number;
    totalKm: number;
    dureeMoyenneMin: number;
    annulations: number;
    ponctualite: number;
    passagersUniques: number;
    gainNet: number;
  };
  co2ParMois: CO2Mois[];
  scatterCO2Distance: DataPointCO2Distance[];
  notesParSemaine: DonneesNotesHebdo[];
  distributionNotes: number[];
  badgesObtenus: BadgeObtenu[];
  derniersTrajetsSummary: TrajetResume[];
  impactEco: ImpactEco;
}
