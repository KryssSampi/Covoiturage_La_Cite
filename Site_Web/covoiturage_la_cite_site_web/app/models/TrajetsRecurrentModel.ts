/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: trajets_recurrents */

export class TrajetsRecurrentModel {
  id: string;
  conducteur_id: string;
  trajet_template_id: string;
  jours_semaine: string;
  heure_depart: string;
  actif: boolean;
  date_debut: string;
  date_fin?: string | null;
  nb_instances_generees: number;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<TrajetsRecurrentModel>) {
    if (data) Object.assign(this, data);
  }
}
