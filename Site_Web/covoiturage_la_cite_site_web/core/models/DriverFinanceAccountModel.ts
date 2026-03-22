/**
 * Modèle compte finances conducteur (gains dans l'application).
 * Distinct du BankAccountModel : ce compte représente les gains accumulés
 * dans la plateforme Cité-Voiturage. Le conducteur peut demander un retrait
 * vers son compte bancaire (BankAccountModel).
 * Ce modèle sera migré vers un serveur distant lors de la mise en production.
 */
export interface DriverFinanceTransaction {
  id: string;
  type: "revenu_trajet" | "penalite" | "retrait_banque" | "compensation";
  montant: number;
  description: string;
  trajetId?: string;
  statut: "confirme" | "en_transit" | "penalite";
  createdAt: string;
}

export interface DriverFinanceAccountModel {
  id: string;
  /** Identifiant du conducteur */
  driverId: string;
  /** Solde disponible pour retrait (revenus nets après commission + pénalités) */
  soldeDisponible: number;
  /** Montant en transit (trajets en cours, paiement non encore capturé) */
  soldeEnTransit: number;
  /** Pénalités cumulées non encore prélevées */
  soldePenalites: number;
  /** Taux de prélèvement actuel pour les pénalités (10% à 20%) */
  tauxPrelevement: number;
  /** Commission plateforme (15%) */
  commission: number;
  /** Historique des transactions */
  transactions: DriverFinanceTransaction[];
  updatedAt: string;
}
