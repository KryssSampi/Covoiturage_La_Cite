/**
 * Types pour la page Go! Board — gamification et réputation.
 */

/** Point de données sur la progression du GoScore dans le temps */
export interface DataPointGoScore {
  date: Date;
  score: number;
  typeEvenement: "gain_trajet" | "perte" | "badge" | "gain_avis";
  delta: number;
}

/** Mission hebdomadaire avec système de progression */
export interface Mission {
  id: string;
  titre: string;
  description: string;
  pointsRecompense: number;
  progres: number;
  objectif: number;
  estCompletee: boolean;
}

/** Défi écologique avec 3 états possibles */
export interface DefiEcologique {
  id: string;
  nom: string;
  cible: string;
  progres: number;
  statut: "actif" | "verrouille" | "complete";
  recompense: string;
}

/** Entrée dans le classement mensuel */
export interface EntreeClassement {
  rang: number;
  utilisateurId: string;
  nom: string;
  score: number;
  nbTrajets: number;
  note: number;
  estMoi: boolean;
}

/** Entrée dans l'historique des points GoScore */
export interface EntreeHistoriquePts {
  label: string;
  pts: number;
  signe: "+" | "-";
  date: Date;
}

/** Palier de réputation */
export type GoTier = "Excellent" | "Bon" | "Passable" | "Restreint";

/** Modèle complet de la page Go! Board */
export interface GoBoardPageModel {
  utilisateurId: string;
  goScore: number;
  goScoreLabel: string;
  tier: GoTier;
  rang: number;
  pointsGagnes: number;
  pointsPerdus: number;
  progressionScatter: DataPointGoScore[];
  missions: Mission[];
  classement: EntreeClassement[];
  defisEco: DefiEcologique[];
  historiquePts: EntreeHistoriquePts[];
}
