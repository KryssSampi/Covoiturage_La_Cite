/**
 * Modèle compte finances passager (économies dans l'application).
 * Distinct du BankAccountModel : ce compte représente les économies estimées
 * du passager par rapport au transport individuel, ainsi que les fonds en transit.
 * Ce modèle sera migré vers un serveur distant lors de la mise en production.
 */
export interface PassengerFinanceTransaction {
  id: string;
  type: "economie_trajet" | "paiement_trajet" | "remboursement" | "holding";
  montant: number;
  description: string;
  trajetId?: string;
  statut: "confirme" | "en_transit" | "rembourse";
  createdAt: string;
}

export interface PassengerFinanceAccountModel {
  id: string;
  /** Identifiant du passager */
  passengerId: string;
  /** Économies estimées vs transport individuel (cumulatif) */
  economiesEstimees: number;
  /** Fonds en transit (réservations en cours, holding non capturé) */
  fondsEnTransit: number;
  /** Total dépensé sur la plateforme */
  totalDepense: number;
  /** Nombre total de trajets complétés */
  nbTrajetsCompletes: number;
  /** Historique des transactions passager */
  transactions: PassengerFinanceTransaction[];
  updatedAt: string;
}
