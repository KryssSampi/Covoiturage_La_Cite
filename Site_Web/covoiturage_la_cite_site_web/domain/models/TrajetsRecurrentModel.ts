/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: trajets_recurrents */

export class TrajetsRecurrentModel {
  id: string = '';
  conducteur_id: string = '';
  trajet_template_id: string = '';
  jours_semaine: string = '';
  heure_depart: string = '';
  actif: boolean = false;
  date_debut: string = '';
  date_fin?: string | null = null;
  nb_instances_generees: number = 0;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<TrajetsRecurrentModel>) {
    if (data) Object.assign(this, data);
  }
}
