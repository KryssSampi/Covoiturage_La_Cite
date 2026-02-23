/* AUTO-GENERATED - 2026-02-15 02:48:22 */
/* Table: waypoints_trajet */

export class WaypointsTrajetModel {
  id: string = '';
  trajet_id: string = '';
  ordre: number = 0;
  position: object | null = null;
  adresse: string = '';
  type: string = '';
  heure_estimee?: string | null = null;
  created_at: string = '';

  constructor(data?: Partial<WaypointsTrajetModel>) {
    if (data) Object.assign(this, data);
  }
}
