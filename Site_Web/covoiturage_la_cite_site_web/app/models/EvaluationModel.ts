/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: evaluations */

export class EvaluationModel {
  id: string;
  trajet_id: string;
  reservation_id: string;
  evaluateur_id: string;
  evalue_id: string;
  role_evalue: string;
  note: number;
  commentaire?: string | null;
  tags_json?: any | null;
  signale_comme_inapproprie: boolean;
  masque: boolean;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<EvaluationModel>) {
    if (data) Object.assign(this, data);
  }
}
