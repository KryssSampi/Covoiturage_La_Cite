/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: historique_trajets */

export class HistoriqueTrajetModel {
  id: string;
  trajet_id: string;
  polyline?: any | null;
  duree_reelle_minutes?: number | null;
  distance_reelle_km?: number | null;
  heure_depart_reelle?: string | null;
  heure_arrivee_reelle?: string | null;
  ecart_temps_minutes?: number | null;
  incidents_json?: any | null;
  vitesse_moyenne_kmh?: number | null;
  vitesse_max_kmh?: number | null;
  nb_arrets?: number | null;
  created_at: string;

  constructor(data?: Partial<HistoriqueTrajetModel>) {
    if (data) Object.assign(this, data);
  }
}
