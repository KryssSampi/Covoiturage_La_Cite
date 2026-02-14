/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: zones_campus */

export class ZonesCampuModel {
  id: string;
  nom: string;
  code: string;
  position: any;
  perimetre?: any | null;
  type_zone: string;
  instructions?: string | null;
  photo_url?: string | null;
  actif: boolean;
  capacite?: number | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<ZonesCampuModel>) {
    if (data) Object.assign(this, data);
  }
}
