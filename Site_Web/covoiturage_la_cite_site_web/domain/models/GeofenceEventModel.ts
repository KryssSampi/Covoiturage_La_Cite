/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: geofence_events */

export class GeofenceEventModel {
  id: string = '';
  user_id: string = '';
  geofence_id: string = '';
  event_type: string = '';
  position: object | null = null;
  event_time: string = '';
  metadata_json?: object | null = null;

  constructor(data?: Partial<GeofenceEventModel>) {
    if (data) Object.assign(this, data);
  }
}
