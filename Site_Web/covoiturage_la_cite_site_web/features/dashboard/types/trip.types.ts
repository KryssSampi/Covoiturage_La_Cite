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
}