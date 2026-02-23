/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: profils_conducteur */

export class ProfilsConducteurModel {
  id: string = '';
  user_id: string = '';
  statut_validation: string = '';
  commentaire_admin?: string | null = null;
  validateur_id?: string | null = null;
  points_reputation: number = 0 ;
  note_moyenne?: number | null = null;
  total_trajets: number = 0 ;
  total_passagers: number = 0 ;
  co2_economise_kg: number = 0 ;
  taux_annulation: number = 0 ;
  nb_retards: number = 0 ;
  nb_annulations_tardives: number = 0 ;
  date_validation?: string | null = null;
  date_suspension?: string | null = null;
  raison_suspension?: string | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<ProfilsConducteurModel>) {
    if (data) Object.assign(this, data);
  }
}
