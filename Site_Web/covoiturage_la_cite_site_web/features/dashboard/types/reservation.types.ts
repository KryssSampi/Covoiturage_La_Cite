import { Driver } from "./driver.types";
import { Passenger } from "./passenger.types";
import { ReservationStatus } from "./reservationStatus.types";

export interface Reservation {
  id: string;
  /** ID du trajet associé (TripModel) — nécessaire pour la navigation trajet-en-cours */
  tripId: string;
  departure: string;
  destination: string;
  date: string;
  time: string;
  duration: number | null;
  maxPassengers: number;
  passengers: Passenger[];
  driver: Driver;
  status: ReservationStatus;
  doneDate: string | null;
  /** true lorsque la réservation est confirmée ET que le départ est dans moins de 30 min */
  isImminent?: boolean;
}