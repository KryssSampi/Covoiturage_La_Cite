/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: documents_conducteur */

export class DocumentsConducteurModel {
  id: string;
  conducteur_id: string;
  type_document: string;
  fichier_url: string;
  statut: string;
  commentaire_refus?: string | null;
  date_expiration?: string | null;
  date_soumission: string;
  date_validation?: string | null;
  validateur_id?: string | null;

  constructor(data?: Partial<DocumentsConducteurModel>) {
    if (data) Object.assign(this, data);
  }
}
