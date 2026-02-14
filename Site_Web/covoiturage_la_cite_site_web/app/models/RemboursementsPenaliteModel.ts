/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: remboursements_penalites */

export class RemboursementsPenaliteModel {
  id: string;
  penalite_id: string;
  transaction_id?: string | null;
  montant_rembourse: number;
  balance_restante: number;
  raison_remboursement: string;
  approuve_par: string;
  date_remboursement: string;
  created_at: string;

  constructor(data?: Partial<RemboursementsPenaliteModel>) {
    if (data) Object.assign(this, data);
  }
}
