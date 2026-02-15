/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: exports_donnees */

export class ExportsDonneeModel {
  id: string = '';
  user_id: string = '';
  type_export: string = '';
  tables_exportees_json?: object | null = null;
  fichier_url?: string | null = null;
  statut: string = '';
  date_demande: string = '';
  date_completion?: string | null = null;
  date_expiration_lien?: string | null = null;

  constructor(data?: Partial<ExportsDonneeModel>) {
    if (data) Object.assign(this, data);
  }
}
