/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: participations_defis */

export class ParticipationsDefiModel {
  id: string;
  defi_id: string;
  user_id: string;
  progression_actuelle: number;
  objectif_cible: number;
  complete: boolean;
  date_inscription: string;
  date_completion?: string | null;

  constructor(data?: Partial<ParticipationsDefiModel>) {
    if (data) Object.assign(this, data);
  }
}
