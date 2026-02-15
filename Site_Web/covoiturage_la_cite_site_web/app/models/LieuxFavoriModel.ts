/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: lieux_favoris */

export class LieuxFavoriModel {
  id : string = '';
  user_id: string = '';
  nom_lieu: string = '';
  position: object | null = null;
  adresse: string = '';
  badge?: string | null = null;
  frequence_utilisation: number = 0;
  lieu_principal: boolean = false;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<LieuxFavoriModel>) {
    if (data) Object.assign(this, data);
  }
}
