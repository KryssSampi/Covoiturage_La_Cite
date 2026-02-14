/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: demandes_multiples_tracking */

export class DemandesMultiplesTrackingModel {
  id: string;
  passager_id: string;
  recherche_id?: string | null;
  reservation_ids_json: any;
  nb_demandes_actives: number;
  nb_demandes_max: number;
  reservation_acceptee_id?: string | null;
  date_auto_annulation?: string | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<DemandesMultiplesTrackingModel>) {
    if (data) Object.assign(this, data);
  }
}
