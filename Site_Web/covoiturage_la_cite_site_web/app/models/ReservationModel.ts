/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: reservations */

export class ReservationModel {
  id: string = '';
  trajet_id: string = '';
  passager_id: string = '';
  statut: string = '';
  montant_total: number = 0;
  montant_rembourse?: number | null = null ;
  date_demande: string = '';
  date_expiration: string = '';
  date_reponse_conducteur?: string | null = null;
  date_annulation?: string | null = null;
  raison_annulation?: string | null = null;
  raison_refus?: string | null = null;
  position_file_attente?: number | null = null;
  embarquement_confirme_conducteur: boolean = false;
  embarquement_confirme_passager: boolean = false;
  heure_embarquement?: string | null = null;
  score_compatibilite?: number | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<ReservationModel>) {
    if (data) Object.assign(this, data);
  }
}
