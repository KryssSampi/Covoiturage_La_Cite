/**
 * Résumé financier du conducteur pour la section Finance.
 * Aligne sur §7 (Paiement Simulé) et §1.2 (Statistiques conducteur).
 *
 * TODO: GET /api/driver/{userId}/finance/summary
 *   Retourne gains mensuels, hebdomadaires, en transit et pénalités.
 */
export interface DriverFinanceSummary {
  /** Identifiant interne */
  id: number;
  /** Gain net accumulé sur le mois courant en CAD */
  mensualProfit: number;
  /** Devise affichée (ex: "CAD") */
  currency: string;
  /** Gain confirmé sur la semaine courante */
  weeklyProfit: number;
  /**
   * Gain en attente de libération (trajet terminé mais paiement pas encore crédité).
   * Correspond aux trajets en statut Completed non encore validés.
   */
  weeklyPendingProfit: number;
  /**
   * Montant total des pénalités actives (annulation tardive, no-show...).
   * Aligne sur §21 (Pénalités Automatiques).
   */
  penalties: number;
}
