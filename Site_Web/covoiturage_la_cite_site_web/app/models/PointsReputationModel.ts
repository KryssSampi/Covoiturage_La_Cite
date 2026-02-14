/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: points_reputation */

export class PointsReputationModel {
  id: string;
  user_id: string;
  points_actuels: number;
  points_maximum: number;
  historique_json?: any | null;
  derniere_modification: string;

  constructor(data?: Partial<PointsReputationModel>) {
    if (data) Object.assign(this, data);
  }
}
