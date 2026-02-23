import { Destination } from "@/features/dashboard/types/destination.types";

export const FIXTURES_RECENT_DESTINATIONS: Destination[] = [
  { id: "1", departure: "Ottawa",     destination: "Toronto",          disponibility: 3, favoriteDriverCount: 2 },
  { id: "2", departure: "Montreal",   destination: "Rideau",           disponibility: 2, favoriteDriverCount: 1 },
  { id: "3", departure: "Gatineau",   destination: "Hull",             disponibility: 4, favoriteDriverCount: 3 },
  { id: "4", departure: "Quebec",     destination: "Laval",            disponibility: 1, favoriteDriverCount: 0 },
  { id: "5", departure: "Sherbrooke", destination: "Magog",            disponibility: 2, favoriteDriverCount: 1 },
];
