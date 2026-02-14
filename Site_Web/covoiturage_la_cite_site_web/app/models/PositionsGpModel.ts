/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: positions_gps */

export class PositionsGpModel {
  id: string;
  trajet_id: string;
  conducteur_id: string;
  position: any;
  latitude: number;
  longitude: number;
  vitesse_kmh?: number | null;
  cap_degres?: number | null;
  altitude_m?: number | null;
  precision_m?: number | null;
  timestamp_position: string;
  en_deplacement: boolean;
  created_at: string;

  constructor(data?: Partial<PositionsGpModel>) {
    if (data) Object.assign(this, data);
  }
}
