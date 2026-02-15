/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: positions_gps */

export class PositionsGpModel {
  id: string = '';
  trajet_id: string = '';
  conducteur_id: string = '';
  position: object | null = null;
  latitude: number = 0;
  longitude: number = 0;
  vitesse_kmh?: number | null = null;
  cap_degres?: number | null = null;
  altitude_m?: number | null = null;
  precision_m?: number | null = null;
  timestamp_position: string = '';
  en_deplacement: boolean = false;
  created_at: string = '';

  constructor(data?: Partial<PositionsGpModel>) {
    if (data) Object.assign(this, data);
  }
}
