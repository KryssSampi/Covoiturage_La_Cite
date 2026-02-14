/* AUTO-GENERATED - 2026-02-14 03:37:59 */
/* Table: badges */

export class BadgeModel {
  id: string;
  code: string;
  nom: string;
  description?: string | null;
  icon_url?: string | null;
  categorie: string;
  condition_json: any;
  points_reputation_requis?: number | null;
  created_at: string;

  constructor(data?: Partial<BadgeModel>) {
    if (data) Object.assign(this, data);
  }
}
