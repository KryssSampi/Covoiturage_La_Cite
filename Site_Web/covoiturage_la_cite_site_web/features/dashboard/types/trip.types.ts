import { Driver } from "./driver.types";
import { Passenger } from "./passenger.types";

export interface Trip {
  id: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  maxPassengers: number;
  passengers: Passenger[];
  driver: Driver;
  doneDate: string | null;
  /** Coordonnées GPS du point de départ [lng, lat] — utilisées pour tracer la polyline */
  departureCoords?: [number, number];
  /** Coordonnées GPS du point d'arrivée [lng, lat] — utilisées pour tracer la polyline */
  arrivalCoords?: [number, number];
  /** Polyline du trajet sous forme de tableau [lat, lng] (format Leaflet) */
  latLngs?: [number, number][];
  /** true lorsque le trajet est confirmé/publié ET que le départ est dans moins de 30 min */
  isImminent?: boolean;
}