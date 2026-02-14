/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: geofences_mobile */

export class GeofencesMobileModel {
  id: string;
  zone_id: string;
  nom: string;
  perimetre: any;
  rayon_m?: number | null;
  monitoring_actif: boolean;
  trigger_events_json?: any | null;
  created_at: string;

  constructor(data?: Partial<GeofencesMobileModel>) {
    if (data) Object.assign(this, data);
  }
}
