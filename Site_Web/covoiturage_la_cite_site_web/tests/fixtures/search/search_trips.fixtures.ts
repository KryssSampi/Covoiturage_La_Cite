/**
 * @file search_trips.fixtures.ts
 * @description Base de données fictive de trajets publiés pour la feature Search.
 *
 * Couvre trois catégories :
 *   1. Trajets intra-Ottawa (quartiers → Campus La Cité)
 *   2. Ottawa → villes avoisinantes (Gatineau, Kanata, Barrhaven, etc.)
 *   3. Ottawa → Montréal (longue distance)
 *
 * Chaque Trip inclut departureCoords et arrivalCoords [lng, lat]
 * pour permettre le filtrage Haversine dans usePassengerSearch.
 *
 * Photos de profil : placeholder générique (pas de dépendance externe).
 */

import { Trip } from "@/features/dashboard/types/trip.types";

// Extension du type Trip avec les coordonnées géographiques
export interface TripWithCoords extends Trip {
  departureCoords: [number, number]; // [lng, lat]
  arrivalCoords:   [number, number]; // [lng, lat]
}

// ─── Coordonnées clés d'Ottawa ────────────────────────────────────────────────

const COORDS = {
  lacite:        [-75.6753, 45.4189] as [number, number], // Campus La Cité
  orleans:       [-75.5090, 45.4560] as [number, number],
  barrhaven:     [-75.7376, 45.2676] as [number, number],
  kanata:        [-75.8977, 45.3494] as [number, number],
  nepean:        [-75.7197, 45.3473] as [number, number],
  gloucester:    [-75.5830, 45.4200] as [number, number],
  vanier:        [-75.6467, 45.4333] as [number, number],
  rockcliffe:    [-75.6506, 45.4443] as [number, number],
  centertown:    [-75.6973, 45.4146] as [number, number],
  westboro:      [-75.7512, 45.3975] as [number, number],
  hintonburg:    [-75.7218, 45.4051] as [number, number],
  southkeys:     [-75.6396, 45.3698] as [number, number],
  gatineau:      [-75.7162, 45.4765] as [number, number],
  aylmer:        [-75.8453, 45.3944] as [number, number],
  stittsville:   [-75.9163, 45.2594] as [number, number],
  manotick:      [-75.6819, 45.2259] as [number, number],
  // Longue distance
  montreal:      [-73.5674, 45.5017] as [number, number],
  longueuil:     [-73.5118, 45.5313] as [number, number],
  laval:         [-73.6930, 45.5679] as [number, number],
  cornwall:      [-74.7276, 45.0180] as [number, number],
  kingston:      [-76.4813, 44.2312] as [number, number],
};

// ─── Conducteurs fictifs ──────────────────────────────────────────────────────

const DRIVERS = [
  { id: 1,  name: "Julie Tremblay",   rating: 4.8, tripsCount: 42, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 2,  name: "Marc Bouchard",    rating: 4.6, tripsCount: 28, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 3,  name: "Amina Diallo",     rating: 4.9, tripsCount: 67, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 4,  name: "Kevin Nguyen",     rating: 4.5, tripsCount: 15, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 5,  name: "Sophie Larivière", rating: 4.7, tripsCount: 34, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 6,  name: "Youssef El-Amin",  rating: 4.4, tripsCount: 19, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 7,  name: "Claire Moreau",    rating: 4.9, tripsCount: 88, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 8,  name: "Patrick Ouellet",  rating: 4.3, tripsCount: 11, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 9,  name: "Nadia Côté",       rating: 4.8, tripsCount: 56, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 10, name: "Thomas Girard",    rating: 4.6, tripsCount: 23, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 11, name: "Fatima Idrissi",   rating: 4.7, tripsCount: 31, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
  { id: 12, name: "Luc Gagnon",       rating: 4.5, tripsCount: 44, pictureUrl: "/assets/placeholder/placeholer-profile-picture.png" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

let idCounter = 1;

function makeTrip(
  departure: string,
  destination: string,
  depCoords: [number, number],
  arrCoords: [number, number],
  driverIdx: number,
  date: string,
  time: string,
  price: number,
  maxPassengers: number,
  passengerCount: number,
): TripWithCoords {
  const driver = DRIVERS[driverIdx % DRIVERS.length];
  const passengers = Array.from({ length: passengerCount }, (_, i) => ({
    id:         idCounter * 100 + i,
    name:       `Passager ${i + 1}`,
    pictureUrl: "/assets/placeholder/placeholer-profile-picture.png",
    rating:     0,
    tripsCount: 0,
  }));

  return {
    id:               idCounter++,
    departure,
    destination,
    date,
    time,
    price,
    maxPassengers,
    passengers,
    driver,
    doneDate:         null,
    departureCoords:  depCoords,
    arrivalCoords:    arrCoords,
  };
}

// ─── Dates (relative à aujourd'hui pour rester fraîches) ─────────────────────

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

// ─── CATÉGORIE 1 : Intra-Ottawa → Campus La Cité ──────────────────────────────

const INTRA_OTTAWA: TripWithCoords[] = [
  // Orléans → La Cité (3 trajets différentes heures)
  makeTrip("Orléans", "Campus La Cité", COORDS.orleans, COORDS.lacite, 0, futureDate(1), "07:30", 6, 3, 1),
  makeTrip("Orléans", "Campus La Cité", COORDS.orleans, COORDS.lacite, 1, futureDate(1), "08:00", 7, 4, 2),
  makeTrip("Orléans", "Campus La Cité", COORDS.orleans, COORDS.lacite, 4, futureDate(2), "08:30", 5, 3, 0),

  // Barrhaven → La Cité
  makeTrip("Barrhaven", "Campus La Cité", COORDS.barrhaven, COORDS.lacite, 2, futureDate(1), "07:45", 8, 3, 1),
  makeTrip("Barrhaven", "Campus La Cité", COORDS.barrhaven, COORDS.lacite, 5, futureDate(2), "08:15", 7, 4, 0),
  makeTrip("Barrhaven", "Campus La Cité", COORDS.barrhaven, COORDS.lacite, 9, futureDate(3), "07:30", 9, 3, 2),

  // Kanata → La Cité
  makeTrip("Kanata", "Campus La Cité", COORDS.kanata, COORDS.lacite, 3, futureDate(1), "08:00", 9, 4, 1),
  makeTrip("Kanata", "Campus La Cité", COORDS.kanata, COORDS.lacite, 6, futureDate(2), "08:30", 8, 3, 2),
  makeTrip("Kanata → Centrum", "Campus La Cité", COORDS.kanata, COORDS.lacite, 10, futureDate(1), "07:45", 10, 4, 0),

  // Nepean → La Cité
  makeTrip("Nepean", "Campus La Cité", COORDS.nepean, COORDS.lacite, 7, futureDate(1), "08:00", 6, 3, 1),
  makeTrip("Nepean Sud", "Campus La Cité", COORDS.nepean, COORDS.lacite, 11, futureDate(2), "08:30", 7, 4, 2),
  makeTrip("Nepean", "Campus La Cité", COORDS.nepean, COORDS.lacite, 0, futureDate(3), "07:15", 5, 3, 0),

  // Gloucester → La Cité
  makeTrip("Gloucester", "Campus La Cité", COORDS.gloucester, COORDS.lacite, 8, futureDate(1), "07:50", 5, 4, 2),
  makeTrip("Gloucester", "Campus La Cité", COORDS.gloucester, COORDS.lacite, 1, futureDate(2), "08:20", 6, 3, 1),

  // Vanier → La Cité
  makeTrip("Vanier", "Campus La Cité", COORDS.vanier, COORDS.lacite, 2, futureDate(1), "08:10", 4, 3, 1),
  makeTrip("Vanier Est", "Campus La Cité", COORDS.vanier, COORDS.lacite, 6, futureDate(2), "07:55", 5, 4, 0),

  // Westboro → La Cité
  makeTrip("Westboro", "Campus La Cité", COORDS.westboro, COORDS.lacite, 3, futureDate(1), "08:00", 6, 3, 1),
  makeTrip("Westboro", "Campus La Cité", COORDS.westboro, COORDS.lacite, 9, futureDate(3), "08:30", 5, 4, 2),

  // Hintonburg → La Cité
  makeTrip("Hintonburg", "Campus La Cité", COORDS.hintonburg, COORDS.lacite, 4, futureDate(1), "08:15", 5, 3, 0),

  // South Keys → La Cité
  makeTrip("South Keys", "Campus La Cité", COORDS.southkeys, COORDS.lacite, 7, futureDate(1), "07:40", 7, 4, 1),
  makeTrip("South Keys", "Campus La Cité", COORDS.southkeys, COORDS.lacite, 10, futureDate(2), "08:00", 6, 3, 2),

  // Retours Campus La Cité → divers quartiers (fin de journée)
  makeTrip("Campus La Cité", "Orléans", COORDS.lacite, COORDS.orleans, 0, futureDate(1), "17:00", 6, 3, 1),
  makeTrip("Campus La Cité", "Barrhaven", COORDS.lacite, COORDS.barrhaven, 2, futureDate(1), "17:30", 8, 3, 0),
  makeTrip("Campus La Cité", "Kanata", COORDS.lacite, COORDS.kanata, 5, futureDate(2), "16:45", 9, 4, 2),
  makeTrip("Campus La Cité", "Nepean", COORDS.lacite, COORDS.nepean, 8, futureDate(1), "17:15", 6, 3, 1),

  // Rockcliffe → La Cité
  makeTrip("Rockcliffe Park", "Campus La Cité", COORDS.rockcliffe, COORDS.lacite, 11, futureDate(1), "08:05", 5, 3, 0),

  // Manotick → La Cité
  makeTrip("Manotick", "Campus La Cité", COORDS.manotick, COORDS.lacite, 3, futureDate(2), "07:30", 10, 4, 1),
  makeTrip("Manotick", "Campus La Cité", COORDS.manotick, COORDS.lacite, 6, futureDate(3), "07:45", 9, 3, 2),
];

// ─── CATÉGORIE 2 : Ottawa ↔ Villes avoisinantes ───────────────────────────────

const OTTAWA_REGION: TripWithCoords[] = [
  // Ottawa → Gatineau
  makeTrip("Ottawa Centre", "Gatineau", COORDS.centertown, COORDS.gatineau, 0, futureDate(1), "08:30", 7, 4, 1),
  makeTrip("Campus La Cité", "Gatineau", COORDS.lacite, COORDS.gatineau, 3, futureDate(2), "17:00", 6, 3, 0),
  makeTrip("Vanier", "Gatineau Centre", COORDS.vanier, COORDS.gatineau, 7, futureDate(1), "09:00", 6, 4, 2),

  // Ottawa → Aylmer
  makeTrip("Ottawa Ouest", "Aylmer", COORDS.westboro, COORDS.aylmer, 1, futureDate(1), "08:00", 8, 3, 1),
  makeTrip("Kanata", "Aylmer", COORDS.kanata, COORDS.aylmer, 4, futureDate(2), "07:30", 9, 4, 0),

  // Ottawa → Stittsville
  makeTrip("Kanata", "Stittsville", COORDS.kanata, COORDS.stittsville, 2, futureDate(1), "08:45", 5, 3, 1),
  makeTrip("Ottawa Ouest", "Stittsville", COORDS.westboro, COORDS.stittsville, 9, futureDate(2), "08:00", 7, 4, 2),

  // Ottawa → Manotick
  makeTrip("Ottawa Sud", "Manotick", COORDS.southkeys, COORDS.manotick, 5, futureDate(1), "17:30", 8, 3, 0),
  makeTrip("Campus La Cité", "Manotick", COORDS.lacite, COORDS.manotick, 10, futureDate(3), "17:15", 9, 4, 1),

  // Retours
  makeTrip("Gatineau", "Ottawa Centre", COORDS.gatineau, COORDS.centertown, 6, futureDate(1), "17:30", 7, 4, 2),
  makeTrip("Gatineau", "Campus La Cité", COORDS.gatineau, COORDS.lacite, 11, futureDate(2), "08:15", 6, 3, 0),
  makeTrip("Stittsville", "Ottawa Centre", COORDS.stittsville, COORDS.centertown, 0, futureDate(1), "07:45", 8, 4, 1),
];

// ─── CATÉGORIE 3 : Ottawa → Montréal (longue distance) ───────────────────────

const OTTAWA_MONTREAL: TripWithCoords[] = [
  // Ottawa → Montréal (vendredi soir, dimanche soir = plus fréquents)
  makeTrip("Ottawa Centre", "Montréal", COORDS.centertown, COORDS.montreal, 0, futureDate(2), "16:00", 25, 3, 0),
  makeTrip("Ottawa Centre", "Montréal", COORDS.centertown, COORDS.montreal, 2, futureDate(2), "17:00", 28, 4, 1),
  makeTrip("Campus La Cité", "Montréal", COORDS.lacite, COORDS.montreal, 4, futureDate(2), "17:30", 22, 3, 2),
  makeTrip("Kanata", "Montréal", COORDS.kanata, COORDS.montreal, 6, futureDate(2), "15:00", 30, 4, 0),
  makeTrip("Barrhaven", "Montréal", COORDS.barrhaven, COORDS.montreal, 8, futureDate(2), "14:30", 27, 3, 1),
  makeTrip("Orléans", "Montréal", COORDS.orleans, COORDS.montreal, 10, futureDate(2), "16:30", 24, 4, 2),

  // Ottawa → Montréal (lundi matin)
  makeTrip("Ottawa Centre", "Montréal", COORDS.centertown, COORDS.montreal, 1, futureDate(3), "06:00", 20, 4, 0),
  makeTrip("Nepean", "Montréal", COORDS.nepean, COORDS.montreal, 3, futureDate(3), "06:30", 22, 3, 1),
  makeTrip("Campus La Cité", "Montréal", COORDS.lacite, COORDS.montreal, 5, futureDate(3), "07:00", 21, 4, 2),

  // Montréal → Ottawa
  makeTrip("Montréal", "Ottawa Centre", COORDS.montreal, COORDS.centertown, 7, futureDate(2), "18:00", 26, 3, 0),
  makeTrip("Montréal", "Ottawa Centre", COORDS.montreal, COORDS.centertown, 9, futureDate(4), "14:00", 25, 4, 1),
  makeTrip("Montréal", "Campus La Cité", COORDS.montreal, COORDS.lacite, 11, futureDate(3), "18:30", 23, 3, 2),

  // Ottawa → Laval (étape)
  makeTrip("Ottawa Centre", "Laval", COORDS.centertown, COORDS.laval, 0, futureDate(2), "16:00", 22, 4, 1),
  makeTrip("Kanata", "Laval", COORDS.kanata, COORDS.laval, 4, futureDate(2), "15:30", 24, 3, 0),

  // Ottawa → Longueuil
  makeTrip("Ottawa Centre", "Longueuil", COORDS.centertown, COORDS.longueuil, 2, futureDate(2), "17:00", 26, 4, 2),

  // Ottawa → Cornwall (étape)
  makeTrip("Ottawa Centre", "Cornwall", COORDS.centertown, COORDS.cornwall, 6, futureDate(1), "12:00", 12, 4, 1),
  makeTrip("Cornwall", "Montréal", COORDS.cornwall, COORDS.montreal, 8, futureDate(1), "14:00", 14, 3, 0),

  // Weekend — tarifs premium
  makeTrip("Ottawa Sud", "Montréal", COORDS.southkeys, COORDS.montreal, 1, futureDate(5), "13:00", 32, 4, 0),
  makeTrip("Campus La Cité", "Montréal-Centre", COORDS.lacite, COORDS.montreal, 3, futureDate(5), "12:00", 30, 3, 1),
  makeTrip("Westboro", "Montréal", COORDS.westboro, COORDS.montreal, 7, futureDate(6), "10:00", 28, 4, 2),
];

// ─── Export global ────────────────────────────────────────────────────────────

export const ALL_SEARCH_TRIPS: TripWithCoords[] = [
  ...INTRA_OTTAWA,
  ...OTTAWA_REGION,
  ...OTTAWA_MONTREAL,
];

export const INTRA_OTTAWA_TRIPS    = INTRA_OTTAWA;
export const OTTAWA_REGION_TRIPS   = OTTAWA_REGION;
export const OTTAWA_MONTREAL_TRIPS = OTTAWA_MONTREAL;

export default ALL_SEARCH_TRIPS;
