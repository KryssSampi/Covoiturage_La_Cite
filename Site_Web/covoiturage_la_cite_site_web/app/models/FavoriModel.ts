/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: favoris */

export class FavoriModel {
  id: string;
  passager_id: string;
  conducteur_id: string;
  type: string;
  nb_trajets_ensemble: number;
  note_moyenne_recue?: number | null;
  date_ajout: string;
  updated_at: string;

  constructor(data?: Partial<FavoriModel>) {
    if (data) Object.assign(this, data);
  }
}
