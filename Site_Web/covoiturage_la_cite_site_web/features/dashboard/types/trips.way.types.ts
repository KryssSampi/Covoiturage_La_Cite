export interface TripWay {
  /** Identifiant unique de la destination récente */
  id: string;
  /** Ville de départ */
  departure: string;
  /** Ville d'arrivée */
  destination: string;
  /** Points de passage intermédiaires (optionnels, §3.1 Détours possibles) */
  waypoints?: string[];
  /** Date du dernier trajet sur cet itinéraire "YYYY-MM-DD" */
  date: string;
  /** Heure du dernier trajet "HH:mm" */
  time: string;
}