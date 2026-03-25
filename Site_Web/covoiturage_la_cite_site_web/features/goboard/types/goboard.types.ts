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

/** Progression d'un utilisateur sur une GoTask */
export interface GoTaskProgression {
  userId: string;
  isDone: boolean;
  /** Date ISO de complétion — renseigné uniquement quand isDone = true */
  completeAt?: string;
}

/** GoTask stockée en base JSON */
export interface GoTask {
  id: string;
  titlefr: string;
  titleen: string;
  descriptionfr: string;
  descriptionen: string;
  category: "mixte" | "driverOnly" | "passengerOnly";
  link: string;
  points: number;
  progression: GoTaskProgression[];
}

/** GoEvent — entrée dans l'historique des points (GoTasks complétées + autres événements) */
export interface GoEvent {
  id: string;
  titre: string;
  date: string;
  points: number;
  utilisateurId: string;
}

/** Défi écologique avec cible CO₂ et barre de progression */
export interface EcoChallenge {
  id: string;
  titre: string;
  description: string;
  /** Cible en kg de CO₂ économisés */
  cibleCO2Kg: number;
  recompense: string;
}

/** Défi écologique enrichi avec la progression de l'utilisateur */
export interface EcoChallengeAvecProgression extends EcoChallenge {
  /** Progression 0-100 (pourcentage) */
  progres: number;
  statut: "actif" | "verrouille" | "complete";
}

/** Entrée dans le classement hebdomadaire */
export interface EntreeClassement {
  rang: number;
  utilisateurId: string;
  nom: string;
  score: number;
  estMoi: boolean;
}

/** Entrée stockée dans le classement hebdomadaire statique (DB) */
export interface ClassementEntry {
  utilisateurId: string;
  nom: string;
  goScore: number;
}

/** Palier de réputation */
export type GoTier = "Excellent" | "Bon" | "Passable" | "Restreint";

/** Réponse de l'API /api/goboard — données complètes pour la page */
export interface GoBoardApiResponse {
  goScore: number;
  tier: GoTier;
  rang: number;
  pointsGagnes: number;
  pointsPerdus: number;
  goTasks: GoTask[];
  classement: EntreeClassement[];
  defisEco: EcoChallengeAvecProgression[];
  goEvents: GoEvent[];
}

/** Modèle complet de la page Go! Board (legacy — utilisé par les fixtures) */
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
  defisEco: EcoChallengeAvecProgression[];
  goEvents: GoEvent[];
}

/** Mission (legacy — remplacé par GoTask dans la nouvelle archi) */
export interface Mission {
  id: string;
  titre: string;
  description: string;
  pointsRecompense: number;
  progres: number;
  objectif: number;
  estCompletee: boolean;
}
