import { Driver } from "./driver.types";
import { Passenger } from "./passenger.types";

export interface Trip {
  id: number;
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
}