/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: demandes_multiples_tracking */

export class DemandesMultiplesTrackingModel {
  id: string = '';
  passager_id: string = '';
  recherche_id?: string | null = null;
  reservation_ids_json: object | null = null;
  nb_demandes_actives: number = 0;
  nb_demandes_max: number = 0;
  reservation_acceptee_id?: string | null = null;
  date_auto_annulation?: string | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<DemandesMultiplesTrackingModel>) {
    if (data) Object.assign(this, data);
  }
}
