/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: suppressions_compte */

export class SuppressionsCompteModel {
  id: string;
  user_id: string;
  raison: string;
  commentaire?: string | null;
  donnees_anonymisees: boolean;
  donnees_archivees: boolean;
  archive_url?: string | null;
  date_suppression: string;
  created_at: string;

  constructor(data?: Partial<SuppressionsCompteModel>) {
    if (data) Object.assign(this, data);
  }
}
