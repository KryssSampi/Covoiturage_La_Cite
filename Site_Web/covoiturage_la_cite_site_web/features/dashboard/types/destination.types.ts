export interface Destination {
  id: string;
  departure: string;
  destination: string;
  disponibility: number;
  favoriteDriverCount: number;
  /** Coordonnées GPS du départ [lng, lat] */
  departureCoords?: [number, number];
  /** Coordonnées GPS de l'arrivée [lng, lat] */
  arrivalCoords?: [number, number];
}
