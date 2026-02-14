/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: statistiques_globales */

export class StatistiquesGlobaleModel {
  id: string;
  date_stats: string;
  trajets_total: number;
  trajets_completes: number;
  trajets_annules: number;
  demandes_multiples_utilisees: number;
  revenus_app: number;
  revenus_conducteurs: number;
  nouveaux_users: number;
  users_actifs: number;
  note_moyenne_plateforme?: number | null;
  co2_total_economise_kg: number;
  nb_urgences_activees: number;
  nb_signalements: number;
  created_at: string;

  constructor(data?: Partial<StatistiquesGlobaleModel>) {
    if (data) Object.assign(this, data);
  }
}
