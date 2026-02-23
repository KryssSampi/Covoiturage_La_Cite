/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: participations_defis */

export class ParticipationsDefiModel {
  id: string = '';
  defi_id: string = '';
  user_id: string = '';
  progression_actuelle: number = 0;
  objectif_cible: number = 0;
  complete: boolean = false;
  date_inscription: string = '';
  date_completion?: string | null = null;

  constructor(data?: Partial<ParticipationsDefiModel>) {
    if (data) Object.assign(this, data);
  }
}
