import { Destination } from "@/features/dashboard/types/destination.types";
import { FIXTURES_RECENT_DESTINATIONS } from "./recentDestination.fixtures";

export const FIXTURES_USUAL_DESTINATIONS: Destination[] = [
  ...FIXTURES_RECENT_DESTINATIONS.slice(0, 5),
  { id: "6", departure: "Maison",      destination: "Travail",          disponibility: 2, favoriteDriverCount: 1, departureCoords: [-75.6200, 45.4100], arrivalCoords: [-75.6500, 45.4300] },
  { id: "7", departure: "Maison",      destination: "Campus La Cité",   disponibility: 2, favoriteDriverCount: 1, departureCoords: [-75.6200, 45.4100], arrivalCoords: [-75.6830, 45.4215] },
];

