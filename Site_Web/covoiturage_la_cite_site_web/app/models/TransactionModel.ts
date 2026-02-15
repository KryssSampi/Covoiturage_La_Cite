/* AUTO-GENERATED - 2026-02-15 02:48:22 */
/* Table: transactions */

export class TransactionModel {
  id: string = '';
  trajet_id: string = '';
  reservation_id: string = '';
  conducteur_id: string = '';
  passager_id: string = '';
  transaction_code: string = '';
  prix_total: number = 0;
  revenus_conducteur_bruts: number = 0;
  penalite_prelevee: number = 0;
  revenus_conducteur_nets: number = 0;
  commission_app_base: number = 0;
  commission_app_totale: number = 0;
  statut: string = '';
  balance_penalite_avant?: number | null = null;
  balance_penalite_apres?: number | null = null;
  date_pre_autorisation?: string | null = null;
  date_capture?: string | null = null;
  date_remboursement?: string | null = null;
  gateway_transaction_id?: string | null = null;
  failure_reason?: string | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<TransactionModel>) {
    if (data) Object.assign(this, data);
  }
}
