/**
 * Types pour la page Mes Finances — tableau de bord financier conducteur et passager.
 */

import type { BankAccountModel } from "@/core/models/BankAccountModel";

/** Période de filtre financier */
export type PeriodeFinance = "7j" | "mois" | "3mois" | "tout";

/** Transaction financière unitaire */
export interface Transaction {
  id: string;
  type: "revenu" | "penalite" | "transit" | "retrait" | "economie" | "paiement" | "remboursement" | "holding";
  montant: number;
  description: string;
  date: string;
  trajetId?: string;
  nbPassagers?: number;
  statut: "confirme" | "transit" | "penalite" | "rembourse";
}

/** Pénalité active avec possibilité de contestation */
export interface Penalite {
  id: string;
  raison: "retard" | "annulation" | "comportement";
  montant: number;
  date: string;
  trajetId: string;
  description: string;
  routeDescription: string;
  estContestable: boolean;
}

/** Données agrégées par période pour l'histogramme */
export interface DonneesHistogramme {
  label: string;
  montantPrincipal: number;
  montantSecondaire: number;
  nbTrajets: number;
}

/** Point du nuage gains × heure de départ */
export interface DataPointGainHeure {
  heureDepartISO: string;
  montant: number;
  nbPassagers: number;
  creneau: "matin" | "midi" | "soir";
}

/** Message de tendance dynamique */
export interface TrendMessage {
  variant: "up" | "down" | "stable";
  texte: string;
  texteBold: string;
}

/** KPI du résumé mensuel (conducteur uniquement) */
export interface ResumeMensuelData {
  titre: string;
  sousTitre: string;
  revenu: number;
  gainSemaine: number;
  labelSemaine: string;
  objectif: number;
  commission: number;
  nbTrajets: number;
  nbTrajetsCompletes: number;
  tendance: TrendMessage;
}

/** Données conducteur */
export interface FinancesDriverData {
  soldeDisponible: number;
  soldeTransit: number;
  penalitesTotal: number;
  nbTrajetsEnCours: number;
  nbPenalitesActives: number;
  resumeMensuel: ResumeMensuelData;
  penalitesActives: Penalite[];
  scatterGainParHeure: DataPointGainHeure[];
}

/** Données passager */
export interface FinancesPassengerData {
  economiesEstimees: number;
  fondsEnTransit: number;
  totalDepense: number;
  nbTrajetsCompletes: number;
}

/** Réponse complète de l'API /api/finances */
export interface FinancesApiResponse {
  userId: string;
  role: "driver" | "passenger";
  periode: PeriodeFinance;
  /** Transactions filtrées par période — commun aux deux rôles */
  transactions: Transaction[];
  /** Données d'histogramme filtrées par période — commun aux deux rôles */
  histogramme: DonneesHistogramme[];
  /** Messages de tendance dynamiques par section */
  tendances: {
    solde: TrendMessage;
    histogramme: TrendMessage;
    transactions: TrendMessage;
    penalites?: TrendMessage;
  };
  /** Comptes bancaires de l'utilisateur */
  bankAccounts: BankAccountModel[];
  /** Données spécifiques au conducteur — null si passager */
  driver: FinancesDriverData | null;
  /** Données spécifiques au passager — null si conducteur */
  passenger: FinancesPassengerData | null;
}

/** Ancien modèle — conservé pour compatibilité (ne pas supprimer) */
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
  historiqueParSemaine: DonneesHistogramme[];
  scatterGainParHeure: DataPointGainHeure[];
  ibanMasque: string;
  periodeActive: PeriodeFinance;
}

/** Ancien alias — conservé pour compatibilité */
export type DonneesSemaine = DonneesHistogramme;
