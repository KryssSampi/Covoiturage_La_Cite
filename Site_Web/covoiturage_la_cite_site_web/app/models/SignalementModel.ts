/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: signalements */

export class SignalementModel {
  id: string;
  signaleur_id: string;
  signale_id: string;
  trajet_id?: string | null;
  reservation_id?: string | null;
  motif: string;
  gravite: string;
  description: string;
  statut: string;
  admin_responsable_id?: string | null;
  action_prise?: string | null;
  penalite_appliquee: boolean;
  penalite_id?: string | null;
  date_signalement: string;
  date_resolution?: string | null;
  created_at: string;

  constructor(data?: Partial<SignalementModel>) {
    if (data) Object.assign(this, data);
  }
}
