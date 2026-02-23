/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: signalements */

export class SignalementModel {
  id: string = '';
  signaleur_id: string = '';
  signale_id: string = '';
  trajet_id?: string | null = null;
  reservation_id?: string | null = null;
  motif: string = '';
  gravite: string = '';
  description: string = '';
  statut: string = '';
  admin_responsable_id?: string | null = null;
  action_prise?: string | null = null;
  penalite_appliquee: boolean = false;
  penalite_id?: string | null = null;
  date_signalement: string = '';
  date_resolution?: string | null = null;
  created_at: string = '';

  constructor(data?: Partial<SignalementModel>) {
    if (data) Object.assign(this, data);
  }
}
