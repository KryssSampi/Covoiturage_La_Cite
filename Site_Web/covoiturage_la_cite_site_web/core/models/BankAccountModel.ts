/**
 * Modèle compte bancaire simulé.
 * Simule un vrai compte bancaire externe (dépôts, retraits, solde).
 * Ce modèle sera migré vers un serveur distant lors de la mise en production.
 */
export interface BankAccountTransaction {
  id: string;
  type: "depot" | "retrait" | "transit_entrant" | "transit_sortant";
  montant: number;
  description: string;
  statut: "complete" | "en_transit" | "annule";
  createdAt: string;
}

export interface BankAccountModel {
  id: string;
  /** Identifiant de l'utilisateur propriétaire du compte */
  userId: string;
  /** Numéro IBAN masqué (ex: ***1234) */
  ibanMasque: string;
  /** Nom de l'institution bancaire */
  nomBanque: string;
  /** Solde disponible en dollars canadiens */
  soldeDisponible: number;
  /** Montant en transit (non encore confirmé) */
  montantEnTransit: number;
  /** Historique des transactions */
  transactions: BankAccountTransaction[];
  updatedAt: string;
}
