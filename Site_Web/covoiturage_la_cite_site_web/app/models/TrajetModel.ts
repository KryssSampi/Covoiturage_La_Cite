/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: trajets */

export class TrajetModel {
  id: string = '';
  conducteur_id: string = '';
  vehicule_id: string = '';
  point_depart: object = { lat: 0, lng: 0 };
  adresse_depart: string = '';
  point_arrivee: object = { lat: 0, lng: 0 };
  adresse_arrivee: string = '';
  zone_depart_id?: string | null = null;
  zone_arrivee_id?: string | null = null;
  point_rencontre_depart?: object | null = null;
  instructions_rencontre_depart?: string | null = null;
  point_rencontre_arrivee?: object | null = null;
  instructions_rencontre_arrivee?: string | null = null;
  heure_depart_prevue: string = '';
  heure_arrivee_estimee: string = '';
  type_depart: string = '';
  nb_places_disponibles: number = 0;
  nb_places_totales: number = 0;
  prix_par_passager: number = 0;
  distance_km: number = 0;
  duree_minutes: number = 0;
  statut: string = '';
  recurrent: boolean = false;
  trajet_recurrent_id?: string | null = null;
  preferences_json?: object| null = null;
  itineraire_flexible: boolean = false;
  detour_max_minutes?: number | null = null;
  score_matching_min?: number | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<TrajetModel>) {
    if (data) Object.assign(this, data);
  }
}
