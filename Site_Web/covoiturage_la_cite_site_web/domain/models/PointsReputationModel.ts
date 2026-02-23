/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: points_reputation */

export class PointsReputationModel {
  id: string = '' ;
  user_id: string = '';
  points_actuels: number = 0;
  points_maximum: number = 0;
  historique_json?: object | null = null;
  derniere_modification: string = '';


  constructor(data?: Partial<PointsReputationModel>) {
    if (data) Object.assign(this, data);
  }
}
