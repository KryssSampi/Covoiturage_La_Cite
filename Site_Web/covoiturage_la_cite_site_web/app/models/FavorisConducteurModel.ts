/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: favoris_conducteur */

export class FavorisConducteurModel {
  id: string;
  conducteur_id: string;
  passager_id: string;
  type: string;
  nb_trajets_ensemble: number;
  note_moyenne_recue?: number | null;
  date_ajout: string;
  updated_at: string;

  constructor(data?: Partial<FavorisConducteurModel>) {
    if (data) Object.assign(this, data);
  }
}
