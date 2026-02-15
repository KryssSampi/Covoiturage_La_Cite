/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: historique_trajets */

export class HistoriqueTrajetModel {
  id: string = '';
  trajet_id: string = '';
  polyline?: object | null = null;
  duree_reelle_minutes?: number | null = null;
  distance_reelle_km?: number | null = null;
  heure_depart_reelle?: string | null = null;
  heure_arrivee_reelle?: string | null = null;
  ecart_temps_minutes?: number | null = null;
  incidents_json?: object | null = null;
  vitesse_moyenne_kmh?: number | null = null;
  vitesse_max_kmh?: number | null = null;
  nb_arrets?: number | null = null;
  created_at: string = '';

  constructor(data?: Partial<HistoriqueTrajetModel>) {
    if (data) Object.assign(this, data);
  }
}
