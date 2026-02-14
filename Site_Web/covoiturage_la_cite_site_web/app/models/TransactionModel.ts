/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: transactions */

export class TransactionModel {
  id: string;
  trajet_id: string;
  reservation_id: string;
  conducteur_id: string;
  passager_id: string;
  transaction_code: string;
  prix_total: number;
  revenus_conducteur_bruts: number;
  penalite_prelevee: number;
  revenus_conducteur_nets: number;
  commission_app_base: number;
  commission_app_totale: number;
  statut: string;
  balance_penalite_avant?: number | null;
  balance_penalite_apres?: number | null;
  date_pre_autorisation?: string | null;
  date_capture?: string | null;
  date_remboursement?: string | null;
  gateway_transaction_id?: string | null;
  failure_reason?: string | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<TransactionModel>) {
    if (data) Object.assign(this, data);
  }
}
