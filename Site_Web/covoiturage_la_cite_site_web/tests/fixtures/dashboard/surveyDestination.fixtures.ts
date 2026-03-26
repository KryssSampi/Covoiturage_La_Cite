/**
 * @file surveyDestination.fixtures.ts
 * @description Données de test pour les SurveyDestination (récentes, habituelles, souhaitées).
 *
 * Les SurveyDestination contiennent des tripIds (IDs de trajets) — pas d'objets complets.
 * Les IDs référencent les trajets présents dans tests/db/trips.json.
 * Les coordonnées correspondent à des lieux réels de la région d'Ottawa-Gatineau.
 */

import type { SurveyDestination } from "@/features/dashboard/types/survey-destination.types";

// ─── Fixtures — Récentes ─────────────────────────────────────────────────────

export const FIXTURES_SURVEY_RECENT: SurveyDestination[] = [
  {
    id: "sr-1",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    departureCoords: [-75.6830, 45.4215],
    arrivalCoords: [-75.5210, 45.4590],
    tripIds: ["901", "902", "903"],
    favoriteDriverIds: ["1"],
    type: "recent",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "sr-2",
    departure: "Gloucester",
    destination: "Campus La Cité",
    departureCoords: [-75.5600, 45.3600],
    arrivalCoords: [-75.6830, 45.4215],
    tripIds: ["905", "906"],
    favoriteDriverIds: [],
    type: "recent",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "sr-3",
    departure: "Gatineau",
    destination: "Centre Rideau",
    departureCoords: [-75.7380, 45.4765],
    arrivalCoords: [-75.6920, 45.4260],
    tripIds: ["903"],
    favoriteDriverIds: ["3"],
    type: "recent",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
];

// ─── Fixtures — Habituelles ──────────────────────────────────────────────────

export const FIXTURES_SURVEY_USUAL: SurveyDestination[] = [
  {
    id: "su-1",
    departure: "Maison",
    destination: "Campus La Cité",
    departureCoords: [-75.6200, 45.4100],
    arrivalCoords: [-75.6830, 45.4215],
    tripIds: ["904", "905", "906"],
    favoriteDriverIds: ["4", "5"],
    type: "usual",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "su-2",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    departureCoords: [-75.6830, 45.4215],
    arrivalCoords: [-75.5210, 45.4590],
    tripIds: ["901", "902"],
    favoriteDriverIds: ["1"],
    type: "usual",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
  {
    id: "su-3",
    departure: "Kanata",
    destination: "Campus La Cité",
    departureCoords: [-75.9000, 45.3440],
    arrivalCoords: [-75.6830, 45.4215],
    tripIds: ["906"],
    favoriteDriverIds: [],
    type: "usual",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
];

// ─── Fixtures — Souhaitées (wishing) ────────────────────────────────────────

export const FIXTURES_SURVEY_WISHING: SurveyDestination[] = [
  {
    id: "sw-1",
    departure: "Barrhaven",
    destination: "Campus La Cité",
    departureCoords: [-75.7700, 45.2750],
    arrivalCoords: [-75.6830, 45.4215],
    tripIds: ["901", "902"],
    favoriteDriverIds: [],
    type: "wishing",
    lastRefreshedAt: "2026-03-21T08:00:00.000Z",
  },
];
