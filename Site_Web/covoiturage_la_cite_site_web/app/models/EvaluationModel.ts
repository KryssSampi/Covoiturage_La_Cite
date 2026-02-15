/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: evaluations */

export class EvaluationModel {
  id: string = '';
  trajet_id: string = '';
  reservation_id: string = '';
  evaluateur_id: string = '';
  evalue_id: string = '';
  role_evalue: string = '';
  note: number = 0;
  commentaire?: string | null = null;
  tags_json?: object | null = null;
  signale_comme_inapproprie: boolean = false;
  masque: boolean = false;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<EvaluationModel>) {
    if (data) Object.assign(this, data);
  }
}
