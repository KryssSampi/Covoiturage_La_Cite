/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: remboursements_transactions */

export class RemboursementsTransactionModel {
  id: string = '';
  transaction_id: string = '';
  montant: number = 0;
  raison: string = '';
  statut: string = '';
  date_demande: string = '';
  date_traitement?: string | null = null;
  gateway_refund_id?: string | null = null;

  constructor(data?: Partial<RemboursementsTransactionModel>) {
    if (data) Object.assign(this, data);
  }
}
