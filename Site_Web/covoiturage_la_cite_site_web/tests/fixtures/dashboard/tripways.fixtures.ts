/**
 * @file recent-destinations.fixtures.ts
 * @description Données de test pour QuickPlanSection (conducteur).
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/driver/{userId}/recent-destinations?limit=5
 *   Basé sur l'historique des trajets publiés — retourne les itinéraires
 *   distincts les plus récents pour republication rapide.
 */

import { TripWay } from "@/features/dashboard/types/trips.way.types";

export const FIXTURES_TRIP_WAYS: TripWay[] = [
  {
    id: "1",
    departure: "Ottawa",
    destination: "Toronto",
    waypoints: ["Brampton", "Mississauga"],
    date: "2024-06-01",
    time: "10:00 AM",
  },
  {
    id: "2",
    departure: "Montreal",
    destination: "Rideau",
    waypoints: ["Gatineau", "Hull"],
    date: "2024-06-02",
    time: "11:00 AM",
  },
  {
    id: "3",
    departure: "Gatineau",
    destination: "Hull",
    waypoints: ["Ottawa"],
    date: "2026-06-03",
    time: "12:00 PM",
  },
  {
    id: "4",
    departure: "Quebec",
    destination: "Laval",
    waypoints: ["Sainte-Foy", "Lévis"],
    date: "2024-06-04",
    time: "01:00 PM",
  },
  {
    id: "5",
    departure: "Sherbrooke",
    destination: "Magog",
    waypoints: ["Fleurimont", "Rock Forest"],
    date: "2024-06-05",
    time: "02:00 PM",
  },
];
