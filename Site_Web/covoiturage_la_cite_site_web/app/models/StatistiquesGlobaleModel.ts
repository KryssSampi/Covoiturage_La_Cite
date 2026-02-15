/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: statistiques_globales */

export class StatistiquesGlobaleModel {
  id: string = '' ;
  date_stats: string = '';
  trajets_total: number = 0;
  trajets_completes: number = 0;
  trajets_annules: number = 0;
  demandes_multiples_utilisees: number = 0;
  revenus_app: number = 0;
  revenus_conducteurs: number = 0;
  nouveaux_users: number = 0;
  users_actifs: number = 0;
  note_moyenne_plateforme?: number | null = null;
  co2_total_economise_kg: number = 0;
  nb_urgences_activees: number = 0;
  nb_signalements: number = 0;
  created_at: string = '';

  constructor(data?: Partial<StatistiquesGlobaleModel>) {
    if (data) Object.assign(this, data);
  }
}
