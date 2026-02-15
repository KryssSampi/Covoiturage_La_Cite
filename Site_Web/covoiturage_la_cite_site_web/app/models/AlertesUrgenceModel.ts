/* AUTO-GENERATED - 2026-02-15 02:48:17 */
/* Table: alertes_urgence */

export class AlertesUrgenceModel {
  id: string = '';
  user_id: string = '';
  trajet_id?: string | null;
  position_alerte?: object | null;
  type_urgence: string = '';
  description?: string | null;
  statut: string = '';
  contacts_notifies_json?: object | null;
  admin_intervenant_id?: string | null;
  date_alerte: string = '';
  date_resolution?: string | null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<AlertesUrgenceModel>) {
    if (data) Object.assign(this, data);
  }
}
