import { Destination } from "@/features/dashboard/types/destination.types";

export const FIXTURES_RECENT_DESTINATIONS: Destination[] = [
  // Ces noms correspondent exactement aux entrées de FIXTURES_SURVEY_RECENT
  // pour que le lookup surveyMap.get(`${dep}|${arr}`) fonctionne
  { id: "1", departure: "Campus La Cité", destination: "Place d'Orléans", disponibility: 3, favoriteDriverCount: 1, departureCoords: [-75.6830, 45.4215], arrivalCoords: [-75.5210, 45.4590] },
  { id: "2", departure: "Gloucester",     destination: "Campus La Cité",  disponibility: 2, favoriteDriverCount: 0, departureCoords: [-75.5600, 45.3600], arrivalCoords: [-75.6830, 45.4215] },
  { id: "3", departure: "Gatineau",       destination: "Centre Rideau",   disponibility: 4, favoriteDriverCount: 1, departureCoords: [-75.7380, 45.4765], arrivalCoords: [-75.6920, 45.4260] },
  { id: "4", departure: "Kanata",         destination: "Campus La Cité",  disponibility: 1, favoriteDriverCount: 0, departureCoords: [-75.9000, 45.3440], arrivalCoords: [-75.6830, 45.4215] },
  { id: "5", departure: "Campus La Cité", destination: "Place d'Orléans", disponibility: 2, favoriteDriverCount: 1, departureCoords: [-75.6840, 45.4220], arrivalCoords: [-75.5200, 45.4585] },
];
