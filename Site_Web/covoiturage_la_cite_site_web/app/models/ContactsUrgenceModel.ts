/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: contacts_urgence */

export class ContactsUrgenceModel {
  id: string;
  user_id: string;
  nom_complet: string;
  telephone: string;
  email?: string | null;
  relation: string;
  actif: boolean;
  ordre_priorite: number;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<ContactsUrgenceModel>) {
    if (data) Object.assign(this, data);
  }
}
