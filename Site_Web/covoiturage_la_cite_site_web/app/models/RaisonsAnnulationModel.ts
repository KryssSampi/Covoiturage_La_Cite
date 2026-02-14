/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: raisons_annulation */

export class RaisonsAnnulationModel {
  id: string;
  code: string;
  label: string;
  applicable_a: string;
  penalite_associee?: number | null;

  constructor(data?: Partial<RaisonsAnnulationModel>) {
    if (data) Object.assign(this, data);
  }
}
