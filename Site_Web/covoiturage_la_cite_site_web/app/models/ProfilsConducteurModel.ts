/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: profils_conducteur */

export class ProfilsConducteurModel {
  id: string;
  user_id: string;
  statut_validation: string;
  commentaire_admin?: string | null;
  validateur_id?: string | null;
  points_reputation: number;
  note_moyenne?: number | null;
  total_trajets: number;
  total_passagers: number;
  co2_economise_kg: number;
  taux_annulation: number;
  nb_retards: number;
  nb_annulations_tardives: number;
  date_validation?: string | null;
  date_suspension?: string | null;
  raison_suspension?: string | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<ProfilsConducteurModel>) {
    if (data) Object.assign(this, data);
  }
}
