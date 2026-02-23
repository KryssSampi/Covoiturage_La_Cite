/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: partages_position_urgence */

export class PartagesPositionUrgenceModel {
  id: string = '';
  trajet_id: string = '';
  user_id: string = '';
  contact_urgence_id: string = '';
  share_token: string = '';
  actif: boolean = false;
  date_activation: string = '';
  date_expiration: string = '';
  created_at: string = '';

  constructor(data?: Partial<PartagesPositionUrgenceModel>) {
    if (data) Object.assign(this, data);
  }
}
