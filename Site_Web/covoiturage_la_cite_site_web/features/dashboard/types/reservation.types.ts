import { Driver } from "./driver.types";
import { Passenger } from "./passenger.types";
import { ReservationStatus } from "./reservationStatus.types";

export interface Reservation {
  id: number;
  departure: string;
  destination: string;
  date: string;
  time: string;
  maxPassengers: number;
  passengers: Passenger[];
  driver: Driver;
  status: ReservationStatus;
  doneDate: string | null;
}