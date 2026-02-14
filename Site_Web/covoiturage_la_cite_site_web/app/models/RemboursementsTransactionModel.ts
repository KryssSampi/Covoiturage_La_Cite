/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: remboursements_transactions */

export class RemboursementsTransactionModel {
  id: string;
  transaction_id: string;
  montant: number;
  raison: string;
  statut: string;
  date_demande: string;
  date_traitement?: string | null;
  gateway_refund_id?: string | null;

  constructor(data?: Partial<RemboursementsTransactionModel>) {
    if (data) Object.assign(this, data);
  }
}
