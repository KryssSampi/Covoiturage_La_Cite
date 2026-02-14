/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: lieux_favoris */

export class LieuxFavoriModel {
  id: string;
  user_id: string;
  nom_lieu: string;
  position: any;
  adresse: string;
  badge?: string | null;
  frequence_utilisation: number;
  lieu_principal: boolean;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<LieuxFavoriModel>) {
    if (data) Object.assign(this, data);
  }
}
