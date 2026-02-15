/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: contacts_urgence */

export class ContactsUrgenceModel {
  id: string = '';
  user_id: string = '';
  nom_complet: string = '';
  telephone: string = '';
  email?: string | null = null;
  relation: string = '';
  actif: boolean = false;
  ordre_priorite: number = 0;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<ContactsUrgenceModel>) {
    if (data) Object.assign(this, data);
  }
}
