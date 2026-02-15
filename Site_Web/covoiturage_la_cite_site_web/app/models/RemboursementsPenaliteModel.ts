/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: remboursements_penalites */

export class RemboursementsPenaliteModel {
  id: string = '';
  penalite_id: string = '';
  transaction_id?: string | null = null;
  montant_rembourse: number = 0;
  balance_restante: number = 0;
  raison_remboursement: string = '';
  approuve_par: string = '';
  date_remboursement: string = '';
  created_at: string = '';

  constructor(data?: Partial<RemboursementsPenaliteModel>) {
    if (data) Object.assign(this, data);
  }
}
