/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: suppressions_compte */

export class SuppressionsCompteModel {
  id: string = ''; 
  user_id: string = '';
  raison: string = '';
  commentaire?: string | null = null;
  donnees_anonymisees: boolean = false;
  donnees_archivees: boolean = false;
  archive_url?: string | null = null;
  date_suppression: string = '';
  created_at: string = '';

  constructor(data?: Partial<SuppressionsCompteModel>) {
    if (data) Object.assign(this, data);
  }
}
