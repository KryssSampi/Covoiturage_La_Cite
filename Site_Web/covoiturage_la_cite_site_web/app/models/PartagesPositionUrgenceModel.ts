/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: partages_position_urgence */

export class PartagesPositionUrgenceModel {
  id: string;
  trajet_id: string;
  user_id: string;
  contact_urgence_id: string;
  share_token: string;
  actif: boolean;
  date_activation: string;
  date_expiration: string;
  created_at: string;

  constructor(data?: Partial<PartagesPositionUrgenceModel>) {
    if (data) Object.assign(this, data);
  }
}
