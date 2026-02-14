/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: reservations */

export class ReservationModel {
  id: string;
  trajet_id: string;
  passager_id: string;
  statut: string;
  montant_total: number;
  montant_rembourse?: number | null;
  date_demande: string;
  date_expiration: string;
  date_reponse_conducteur?: string | null;
  date_annulation?: string | null;
  raison_annulation?: string | null;
  raison_refus?: string | null;
  position_file_attente?: number | null;
  embarquement_confirme_conducteur: boolean;
  embarquement_confirme_passager: boolean;
  heure_embarquement?: string | null;
  score_compatibilite?: number | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<ReservationModel>) {
    if (data) Object.assign(this, data);
  }
}
