/* AUTO-GENERATED - 2026-02-14 03:38:00 */
/* Table: defis_ecologiques */

export class DefisEcologiqueModel {
  id: string;
  code: string;
  nom: string;
  description?: string | null;
  date_debut: string;
  date_fin: string;
  objectif_json: any;
  recompense_json: any;
  actif: boolean;
  created_at: string;

  constructor(data?: Partial<DefisEcologiqueModel>) {
    if (data) Object.assign(this, data);
  }
}
