export type SimulationEvent =
  | "retard_15_30"
  | "retard_30_60"
  | "retard_60plus"
  | "annulation_conducteur"
  | "no_show_conducteur"
  | "no_show_passager"
  | "trajet_complete"
  | "litige"
  | "accident";

export interface AdminReservation {
  id: string;
  passengerId: string;
  passengerName: string;
  status: string;
  [key: string]: unknown;
}

export interface AdminTrip {
  id: string;
  driverId: string;
  driverName: string;
  status: string;
  pricePerPassenger: number;
  totalPassengers: number;
  reservations: AdminReservation[];
  departureTime?: string;
  departureDate?: string;
  departure?: { label: string; coordinates?: { lat: number; lng: number } };
  arrival?: { label: string; coordinates?: { lat: number; lng: number } };
  polyline?: [number, number][];
  simControlActive?: boolean;
  [key: string]: unknown;
}

export interface SimulateResult {
  success: boolean;
  event: SimulationEvent;
  tripId: string;
  message: string;
  penalite?: { montant: number; pointsReputation: number; suspension?: string } | null;
  affectedReservations: number;
}
