/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: documents_conducteur */

export class DocumentsConducteurModel {
  id: string = '';
  conducteur_id: string = '';
  type_document: string = '';
  fichier_url: string = '';
  statut: string = '';
  commentaire_refus?: string | null = null;
  date_expiration?: string | null = null;
  date_soumission: string = '';
  date_validation?: string | null = null;
  validateur_id?: string | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<DocumentsConducteurModel>) {
    if (data) Object.assign(this, data);
  }
}
