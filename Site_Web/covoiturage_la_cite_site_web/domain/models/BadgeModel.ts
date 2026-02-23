/* AUTO-GENERATED - 2026-02-15 02:48:17 */
/* Table: badges */

export class BadgeModel {
  id: string = '';
  code: string = '';
  nom: string = '';
  description?: string | null;
  icon_url?: string | null;
  categorie: string = '';
  condition_json: object | null = null;
  points_reputation_requis?: number | null;
  created_at: string = '';

  constructor(data?: Partial<BadgeModel>) {
    if (data) Object.assign(this, data);
  }
}
