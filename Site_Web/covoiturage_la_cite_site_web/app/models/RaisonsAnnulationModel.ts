/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: raisons_annulation */

export class RaisonsAnnulationModel {
  id: string = '';
  code: string = '';
  label: string = '';
  applicable_a: string = '';
  penalite_associee?: number | null = null;

  constructor(data?: Partial<RaisonsAnnulationModel>) {
    if (data) Object.assign(this, data);
  }
}
