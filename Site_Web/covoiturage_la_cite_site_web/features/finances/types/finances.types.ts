/**
 * Types pour la page Mes Finances — tableau de bord financier conducteur.
 */

/** Période de filtre financier */
export type PeriodeFinance = "7j" | "mois" | "3mois" | "tout";

/** Transaction financière unitaire */
export interface Transaction {
  id: string;
  type: "revenu" | "penalite" | "transit" | "retrait";
  montant: number;
  description: string;
  date: Date;
  trajetId?: string;
  nbPassagers?: number;
  statut: "confirme" | "transit" | "penalite";
}

/** Pénalité active avec possibilité de contestation */
export interface Penalite {
  id: string;
  raison: "retard" | "annulation" | "comportement";
  montant: number;
  date: Date;
  trajetId: string;
  estContestable: boolean;
}

/** Données agrégées par semaine pour l'histogramme */
export interface DonneesSemaine {
  semaine: string;
  revenusBruts: number;
  penalites: number;
  nbTrajets: number;
}

/** Point du nuage gains × heure de départ */
export interface DataPointGainHeure {
  heureDepartISO: string;
  montant: number;
  nbPassagers: number;
  creneau: "matin" | "midi" | "soir";
}

/** Modèle complet de la page Mes Finances */
export interface FinancesPageModel {
  conducteurId: string;
  soldeDisponible: number;
  soldeTransit: number;
  penalitesTotal: number;
  revenuMensuel: number;
  objectifMensuel: number;
  commission: number;
  nbTrajetsPayants: number;
  transactions: Transaction[];
  penalitesActives: Penalite[];
  historiqueParSemaine: DonneesSemaine[];
  scatterGainParHeure: DataPointGainHeure[];
  ibanMasque: string;
  periodeActive: PeriodeFinance;
}
