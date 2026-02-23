import { Destination } from "@/features/dashboard/types/destination.types";
import { FIXTURES_RECENT_DESTINATIONS } from "./recentDestination.fixtures";

export const FIXTURES_USUAL_DESTINATIONS: Destination[] = [
  ...FIXTURES_RECENT_DESTINATIONS.slice(0, 5), // On prend les 5 premiers de la liste des récents
  { id: "6", departure: "Maison",      destination: "Travail",          disponibility: 2, favoriteDriverCount: 1 },
  { id: "7", departure: "Maison",      destination: "Campus La Cité",   disponibility: 2, favoriteDriverCount: 1 },
];

