/**
 * @file surveyDestination.fixtures.ts
 * @description Données de test pour les SurveyDestination (récentes, habituelles, souhaitées).
 *
 * Chaque SurveyDestination contient 6 trajets matchants pré-calculés en arrière-plan.
 * Les coordonnées correspondent à des lieux réels de la région d'Ottawa-Gatineau.
 */

import type { SurveyDestination } from "@/features/dashboard/types/survey-destination.types";
import type { Trip } from "@/features/dashboard/types/trip.types";

// â”€â”€â”€ Trajets matchants partagés (6 fixtures) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SURVEY_MATCHING_TRIPS: Trip[] = [
  {
    id: "901",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    date: "2026-03-21",
    time: "08:30",
    price: 6,
    maxPassengers: 4,
    passengers: [],
    driver: { id: "1", pictureUrl: "/img/default-avatar.png", name: "Julie Tremblay", rating: 4.8, tripsCount: 60 },
    doneDate: null,
    departureCoords: [-75.6830, 45.4215],
    arrivalCoords: [-75.5210, 45.4590],
  },
  {
    id: "902",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    date: "2026-03-21",
    time: "09:00",
    price: 5,
    maxPassengers: 3,
    passengers: [],
    driver: { id: "2", pictureUrl: "/img/default-avatar.png", name: "Marc Dubois", rating: 4.5, tripsCount: 38 },
    doneDate: null,
    departureCoords: [-75.6840, 45.4220],
    arrivalCoords: [-75.5200, 45.4585],
  },
  {
    id: "903",
    departure: "Promenade de l'Aviation",
    destination: "Centre Rideau",
    date: "2026-03-21",
    time: "08:45",
    price: 7,
    maxPassengers: 4,
    passengers: [],
    driver: { id: "3", pictureUrl: "/img/default-avatar.png", name: "Sophie Martin", rating: 4.9, tripsCount: 85 },
    doneDate: null,
    departureCoords: [-75.6835, 45.4218],
    arrivalCoords: [-75.6920, 45.4260],
  },
  {
    id: "904",
    departure: "Campus La Cité",
    destination: "Bayshore",
    date: "2026-03-22",
    time: "07:30",
    price: 8,
    maxPassengers: 3,
    passengers: [],
    driver: { id: "4", pictureUrl: "/img/default-avatar.png", name: "Pierre Lavoie", rating: 4.3, tripsCount: 22 },
    doneDate: null,
    departureCoords: [-75.6828, 45.4212],
    arrivalCoords: [-75.8060, 45.3490],
  },
  {
    id: "905",
    departure: "Gloucester",
    destination: "Campus La Cité",
    date: "2026-03-22",
    time: "08:00",
    price: 5,
    maxPassengers: 4,
    passengers: [],
    driver: { id: "5", pictureUrl: "/img/default-avatar.png", name: "Fatima Benzahra", rating: 4.7, tripsCount: 45 },
    doneDate: null,
    departureCoords: [-75.5600, 45.3600],
    arrivalCoords: [-75.6832, 45.4215],
  },
  {
    id: "906",
    departure: "Kanata",
    destination: "Campus La Cité",
    date: "2026-03-22",
    time: "07:45",
    price: 10,
    maxPassengers: 3,
    passengers: [],
    driver: { id: "6", pictureUrl: "/img/default-avatar.png", name: "Luc Garneau", rating: 4.6, tripsCount: 30 },
    doneDate: null,
    departureCoords: [-75.9000, 45.3440],
    arrivalCoords: [-75.6830, 45.4215],
  },
];

// â”€â”€â”€ Fixtures â€“ Récentes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const FIXTURES_SURVEY_RECENT: SurveyDestination[] = [
  {
    id: "sr-1",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    departureCoords: [-75.6830, 45.4215],
    arrivalCoords: [-75.5210, 45.4590],
    matchingTrips: SURVEY_MATCHING_TRIPS.slice(0, 3),
    favoriteDriverCount: 1,
    type: "recent",
  },
  {
    id: "sr-2",
    departure: "Gloucester",
    destination: "Campus La Cité",
    departureCoords: [-75.5600, 45.3600],
    arrivalCoords: [-75.6830, 45.4215],
    matchingTrips: SURVEY_MATCHING_TRIPS.slice(4, 6),
    favoriteDriverCount: 0,
    type: "recent",
  },
  {
    id: "sr-3",
    departure: "Gatineau",
    destination: "Centre Rideau",
    departureCoords: [-75.7380, 45.4765],
    arrivalCoords: [-75.6920, 45.4260],
    matchingTrips: [SURVEY_MATCHING_TRIPS[2]],
    favoriteDriverCount: 1,
    type: "recent",
  },
];

// â”€â”€â”€ Fixtures â€“ Habituelles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const FIXTURES_SURVEY_USUAL: SurveyDestination[] = [
  {
    id: "su-1",
    departure: "Maison",
    destination: "Campus La Cité",
    departureCoords: [-75.6200, 45.4100],
    arrivalCoords: [-75.6830, 45.4215],
    matchingTrips: SURVEY_MATCHING_TRIPS.slice(3, 6),
    favoriteDriverCount: 2,
    type: "usual",
  },
  {
    id: "su-2",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    departureCoords: [-75.6830, 45.4215],
    arrivalCoords: [-75.5210, 45.4590],
    matchingTrips: SURVEY_MATCHING_TRIPS.slice(0, 2),
    favoriteDriverCount: 1,
    type: "usual",
  },
  {
    id: "su-3",
    departure: "Kanata",
    destination: "Campus La Cité",
    departureCoords: [-75.9000, 45.3440],
    arrivalCoords: [-75.6830, 45.4215],
    matchingTrips: [SURVEY_MATCHING_TRIPS[5]],
    favoriteDriverCount: 0,
    type: "usual",
  },
];

// â”€â”€â”€ Fixtures â€“ Souhaitées (wishing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const FIXTURES_SURVEY_WISHING: SurveyDestination[] = [
  {
    id: "sw-1",
    departure: "Barrhaven",
    destination: "Campus La Cité",
    departureCoords: [-75.7700, 45.2750],
    arrivalCoords: [-75.6830, 45.4215],
    matchingTrips: SURVEY_MATCHING_TRIPS.slice(0, 2),
    favoriteDriverCount: 0,
    type: "wishing",
  },
];
