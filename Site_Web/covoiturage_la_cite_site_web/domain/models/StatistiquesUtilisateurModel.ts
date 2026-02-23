/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: statistiques_utilisateur */

export class StatistiquesUtilisateurModel {
  id: string = '' ;
  user_id: string = '';
  date_stats: string = '';
  trajets_conducteur: number = 0;
  trajets_passager: number = 0;
  km_parcourus: number = 0  ;
  co2_economise_kg: number = 0;
  economie_financiere_estimee: number = 0;
  revenus_conducteur: number = 0;
  depenses_passager: number = 0;
  evaluations_recues: number = 0;
  note_moyenne?: number | null = null;
  created_at: string = '';

  constructor(data?: Partial<StatistiquesUtilisateurModel>) {
    if (data) Object.assign(this, data);
  }
}
