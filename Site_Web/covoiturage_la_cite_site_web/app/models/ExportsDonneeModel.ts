/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: exports_donnees */

export class ExportsDonneeModel {
  id: string;
  user_id: string;
  type_export: string;
  tables_exportees_json?: any | null;
  fichier_url?: string | null;
  statut: string;
  date_demande: string;
  date_completion?: string | null;
  date_expiration_lien?: string | null;

  constructor(data?: Partial<ExportsDonneeModel>) {
    if (data) Object.assign(this, data);
  }
}
