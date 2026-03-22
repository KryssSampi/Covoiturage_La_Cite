/**
 * @file draft.types.ts
 * @description Type d'un brouillon de trajet (DraftTrip).
 *
 * Un brouillon est un trajet incomplet : certains champs obligatoires
 * à la publication peuvent être vides. L'utilisateur peut le reprendre
 * plus tard via le formulaire CreateTripForm pré-rempli.
 */

import type { TripPreferences } from "@/features/trajets/types";

// ─── DraftTrip ───────────────────────────────────────────────────────────────

export interface DraftTrip {
  /** Identifiant unique du brouillon */
  id: string;

  /** Lieu de départ (peut être vide) */
  departureLocation: string;
  /** Lieu d'arrivée (peut être vide) */
  arrivalLocation: string;

  /** Date de départ — format YYYY-MM-DD (peut être vide) */
  departureDate: string;
  /** Heure de départ — format HH:mm (peut être vide) */
  departureTime: string;

  /** ID du véhicule sélectionné (peut être vide) */
  vehicleId: string;

  /** Nombre max de passagers (issu du véhicule) */
  maxPassengers: number;
  /** Places disponibles offertes */
  availableSeats: number;
  /** Prix par passager en $ */
  pricePerPassenger: number;
  /** Mode de paiement */
  paymentMethod: "cash" | "interac";

  /** Préférences du trajet */
  preferences: TripPreferences;

  /** Notes optionnelles */
  notes?: string;

  // ── Données géographiques (présentes pour les brouillons de création rapide) ──
  /** Coordonnées du point de départ [lat, lng] */
  departureCoords?: [number, number];
  /** Coordonnées du point d'arrivée [lat, lng] */
  arrivalCoords?: [number, number];
  /** Polyline de l'itinéraire [[lat, lng], ...] — calculée par OSRM */
  polyline?: [number, number][];

  /** ID du conducteur propriétaire du brouillon */
  driverId?: string;
  /** Date de création du brouillon */
  createdAt: string;
  /** Date de dernière modification */
  updatedAt: string;
}
