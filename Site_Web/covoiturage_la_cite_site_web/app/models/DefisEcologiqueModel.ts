/* AUTO-GENERATED - 2026-02-15 02:48:18 */
/* Table: defis_ecologiques */

export class DefisEcologiqueModel {
  id: string = '';
  code: string = '';
  nom: string = '';
  description?: string | null = null;
  date_debut: string = '';
  date_fin: string = '';
  objectif_json: object | null = null;
  recompense_json: object | null = null;
  actif: boolean = false;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<DefisEcologiqueModel>) {
    if (data) Object.assign(this, data);
  }
}
