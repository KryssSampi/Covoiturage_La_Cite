/**
 * SignalementModel + LitigeModel
 *
 * SignalementModel : Signalement d'un comportement inapproprié pendant ou après un trajet.
 * LitigeModel      : Dispute formelle entre conducteur et passager (créée manuellement
 *                    ou automatiquement depuis un signalement critique).
 *
 * Reflète les tables "signalements" et "litiges" en base de données.
 */

// ─── Signalement — sous-types ──────────────────────────────────────────────────

export type CibleSignalement  = 'conducteur' | 'passager' | 'trajet' | 'plateforme';
export type NiveauSeverite    = 'critique' | 'severe' | 'modere' | 'info';
export type NiveauSecurite    = 'danger_immediat' | 'incident_recent' | 'malaise' | 'informatif';
export type StatutSignalement = 'soumis' | 'en_cours' | 'resolu' | 'classe';

// ─── Signalement ──────────────────────────────────────────────────────────────

export interface SignalementModel {

  id: string;
  /** Référence lisible, ex: "SIG-20260324-7A3F" */
  referencePublique: string;

  tripId: string;
  reservationId?: string;
  signaleurId: string;
  signaleId?: string;

  cible: CibleSignalement;
  cibleNom: string;
  motifId: string;
  motifLabel: string;
  niveauSeverite: NiveauSeverite;
  niveauSecurite: NiveauSecurite;
  description: string;
  heureIncident: string;
  preuves: string[];

  anonyme: boolean;
  accepterContact: boolean;
  bloquerUtilisateur: boolean;
  notifierResultat: boolean;

  statut: StatutSignalement;
  adminId?: string;
  noteResolution?: string;
  resolvedAt?: string;

  litigeId?: string;
  affiniteUpdated: boolean;

  createdAt: string;
  updatedAt: string;
}

// ─── Litige — sous-types ──────────────────────────────────────────────────────

export type StatutLitige =
  | 'ouvert'
  | 'en_mediation'
  | 'resolu_amiable'
  | 'resolu_rembourse'
  | 'resolu_penalite'
  | 'classe'
  | 'conteste';

export type DecisionLitige =
  | 'aucune'
  | 'remboursement_partiel'
  | 'remboursement_total'
  | 'penalite_conducteur'
  | 'penalite_passager'
  | 'penalite_double'
  | 'avertissement';

export type PartieLitige = 'conducteur' | 'passager' | 'plateforme';

export interface LitigeEchange {
  id: string;
  auteurId: string;
  auteurRole: PartieLitige;
  message: string;
  pieceJointe?: string;
  createdAt: string;
}

// ─── Litige ───────────────────────────────────────────────────────────────────

export interface LitigeModel {

  id: string;
  /** Référence lisible, ex: "LIT-20260324-A8B2" */
  referencePublique: string;

  tripId: string;
  reservationId: string;
  conducteurId: string;
  passagerId: string;
  signalementId?: string;
  adminId?: string;

  motif: string;
  descriptionPlainant: string;
  initiateur: PartieLitige;

  echanges: LitigeEchange[];

  preuvesConducteur: string[];
  preuvesPassager: string[];

  statut: StatutLitige;
  decision: DecisionLitige;
  montantRemboursement?: number;
  montantPenalite?: number;
  justificationDecision?: string;

  transactionRemboursementId?: string;
  penaliteId?: string;

  goScoreConducteurImpacte: boolean;
  goScorePassagerImpacte: boolean;
  affiniteUpdated: boolean;

  deadlineReponse?: string;
  resolvedAt?: string;

  createdAt: string;
  updatedAt: string;
}
