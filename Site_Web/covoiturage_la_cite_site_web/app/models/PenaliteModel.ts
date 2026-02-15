/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: penalites */

export class PenaliteModel {
  id: string = '';
  user_id: string = '';
  trajet_id?: string | null = null;
  reservation_id?: string | null = null;
  type: string = '';
  montant: number = 0;
  taux_prelevement: number = 0;
  raison: string = '';
  statut: string = '';
  montant_rembourse?: number | null = null;
  justificatif_fourni: boolean = false;
  justificatif_url?: string | null = null;
  date_incident: string = '';
  date_contestation?: string | null = null;
  motif_contestation?: string | null = null;
  admin_evaluateur_id?: string | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<PenaliteModel>) {
    if (data) Object.assign(this, data);
  }
}
