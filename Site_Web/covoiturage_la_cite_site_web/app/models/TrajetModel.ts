/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: trajets */

export class TrajetModel {
  id: string;
  conducteur_id: string;
  vehicule_id: string;
  point_depart: any;
  adresse_depart: string;
  point_arrivee: any;
  adresse_arrivee: string;
  zone_depart_id?: string | null;
  zone_arrivee_id?: string | null;
  point_rencontre_depart?: any | null;
  instructions_rencontre_depart?: string | null;
  point_rencontre_arrivee?: any | null;
  instructions_rencontre_arrivee?: string | null;
  heure_depart_prevue: string;
  heure_arrivee_estimee: string;
  type_depart: string;
  nb_places_disponibles: number;
  nb_places_totales: number;
  prix_par_passager: number;
  distance_km: number;
  duree_minutes: number;
  statut: string;
  recurrent: boolean;
  trajet_recurrent_id?: string | null;
  preferences_json?: any | null;
  itineraire_flexible: boolean;
  detour_max_minutes?: number | null;
  score_matching_min?: number | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<TrajetModel>) {
    if (data) Object.assign(this, data);
  }
}
