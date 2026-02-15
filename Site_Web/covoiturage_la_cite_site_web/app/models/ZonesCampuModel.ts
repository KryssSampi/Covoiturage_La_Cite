/* AUTO-GENERATED - 2026-02-15 02:48:22 */
/* Table: zones_campus */

export class ZonesCampuModel {
  id: string = '';
  nom: string = '';
  code: string = '';
  position: object | null   = null;
  perimetre?: object | null = null;
  type_zone: string = '';
  instructions?: string | null = null;
  photo_url?: string | null = null;
  actif: boolean = false;
  capacite?: number | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<ZonesCampuModel>) {
    if (data) Object.assign(this, data);
  }
}
