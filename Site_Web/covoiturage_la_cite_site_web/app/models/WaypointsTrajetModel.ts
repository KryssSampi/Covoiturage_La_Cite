/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: waypoints_trajet */

export class WaypointsTrajetModel {
  id: string;
  trajet_id: string;
  ordre: number;
  position: any;
  adresse: string;
  type: string;
  heure_estimee?: string | null;
  created_at: string;

  constructor(data?: Partial<WaypointsTrajetModel>) {
    if (data) Object.assign(this, data);
  }
}
