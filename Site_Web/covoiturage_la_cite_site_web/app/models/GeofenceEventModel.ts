/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: geofence_events */

export class GeofenceEventModel {
  id: string;
  user_id: string;
  geofence_id: string;
  event_type: string;
  position: any;
  event_time: string;
  metadata_json?: any | null;

  constructor(data?: Partial<GeofenceEventModel>) {
    if (data) Object.assign(this, data);
  }
}
