/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: penalites */

export class PenaliteModel {
  id: string;
  user_id: string;
  trajet_id?: string | null;
  reservation_id?: string | null;
  type: string;
  montant: number;
  taux_prelevement: number;
  raison: string;
  statut: string;
  montant_rembourse?: number | null;
  justificatif_fourni: boolean;
  justificatif_url?: string | null;
  date_incident: string;
  date_contestation?: string | null;
  motif_contestation?: string | null;
  admin_evaluateur_id?: string | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<PenaliteModel>) {
    if (data) Object.assign(this, data);
  }
}
