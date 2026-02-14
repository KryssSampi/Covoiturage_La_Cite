/* AUTO-GENERATED - 2026-02-14 03:37:59 */
/* Table: alertes_urgence */

export class AlertesUrgenceModel {
  id: string;
  user_id: string;
  trajet_id?: string | null;
  position_alerte?: any | null;
  type_urgence: string;
  description?: string | null;
  statut: string;
  contacts_notifies_json?: any | null;
  admin_intervenant_id?: string | null;
  date_alerte: string;
  date_resolution?: string | null;
  created_at: string;

  constructor(data?: Partial<AlertesUrgenceModel>) {
    if (data) Object.assign(this, data);
  }
}
