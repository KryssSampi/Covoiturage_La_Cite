/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: litiges */

export class LitigeModel {
  id: string = '';
  trajet_id: string = '';
  reservation_id: string = '';
  demandeur_id: string = '';
  mise_en_cause_id: string = '';
  motif: string = '';
  description: string = '';
  montant_conteste?: number | null = null;
  statut: string = '';
  admin_responsable_id?: string | null = null;
  decision?: string | null = null;
  montant_rembourse?: number | null = null;
  preuves_json?: object | null = null;
  date_creation: string = '';
  date_resolution?: string | null = null;
  created_at: string = '';

  constructor(data?: Partial<LitigeModel>) {
    if (data) Object.assign(this, data);
  }
}
