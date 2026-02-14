/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: statistiques_utilisateur */

export class StatistiquesUtilisateurModel {
  id: string;
  user_id: string;
  date_stats: string;
  trajets_conducteur: number;
  trajets_passager: number;
  km_parcourus: number;
  co2_economise_kg: number;
  economie_financiere_estimee: number;
  revenus_conducteur: number;
  depenses_passager: number;
  evaluations_recues: number;
  note_moyenne?: number | null;
  created_at: string;

  constructor(data?: Partial<StatistiquesUtilisateurModel>) {
    if (data) Object.assign(this, data);
  }
}
