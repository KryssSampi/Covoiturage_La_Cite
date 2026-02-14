/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: litiges */

export class LitigeModel {
  id: string;
  trajet_id: string;
  reservation_id: string;
  demandeur_id: string;
  mise_en_cause_id: string;
  motif: string;
  description: string;
  montant_conteste?: number | null;
  statut: string;
  admin_responsable_id?: string | null;
  decision?: string | null;
  montant_rembourse?: number | null;
  preuves_json?: any | null;
  date_creation: string;
  date_resolution?: string | null;
  created_at: string;

  constructor(data?: Partial<LitigeModel>) {
    if (data) Object.assign(this, data);
  }
}
