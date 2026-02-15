/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: geofences_mobile */

export class GeofencesMobileModel {
  id: string = '';
  zone_id: string = '';
  nom: string = '';
  perimetre: object | null = null;
  rayon_m?: number | null = null;
  monitoring_actif: boolean = false;
  trigger_events_json?: object | null = null;
  created_at: string = '';

  constructor(data?: Partial<GeofencesMobileModel>) {
    if (data) Object.assign(this, data);
  }
}
