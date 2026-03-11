/**
 * @file rides.area.constants.ts
 * @description Constantes de couleur et de libellés localisés pour la zone
 * d'affichage des trajets du planificateur (RideArea).
 */

import { Language }                         from "@/core/state/app_state";
import { PublishedTripStatus, ReservationStatus } from "@/features/dashboard/types";

// ─── COULEURS HEX — CONDUCTEUR ────────────────────────────────────────────────

/**
 * Palette hexadécimale pour les badges de statut conducteur.
 * Alignée sur les valeurs de PublishedTripStatus.
 */
export const DRIVER_STATUS_HEX: Record<string, string> = {
  [PublishedTripStatus.Published]:  "#9ca3af",
  [PublishedTripStatus.Full]:       "#facc15",
  [PublishedTripStatus.Confirmed]:  "#4ade80",
  [PublishedTripStatus.InProgress]: "#f87171",
  [PublishedTripStatus.Completed]:  "#08316e",
  [PublishedTripStatus.Cancelled]:  "#fb923c",
  [PublishedTripStatus.NoShow]:     "#6b7280",
};

// ─── COULEURS HEX — PASSAGER ──────────────────────────────────────────────────

/**
 * Palette hexadécimale pour les badges de statut passager.
 * Alignée sur les valeurs de ReservationStatus.
 */
export const PASSENGER_STATUS_HEX: Record<string, string> = {
  [ReservationStatus.Confirmed]:  "#4ade80",
  [ReservationStatus.Pending]:    "#4b5563",
  [ReservationStatus.Cancelled]:  "#fb923c",
  [ReservationStatus.Completed]:  "#08316e",
  [ReservationStatus.InProgress]: "#f87171",
};

// ─── LIBELLÉS LOCALISÉS — CONDUCTEUR ─────────────────────────────────────────

/** Libellés bilingues des statuts de trajet pour le rôle conducteur */
export const DRIVER_STATUS_LABELS: Record<string, Record<Language, string>> = {
  [PublishedTripStatus.Published]:  { [Language.FR]: "Publiée",   [Language.EN]: "Published"  },
  [PublishedTripStatus.Full]:       { [Language.FR]: "Complet",   [Language.EN]: "Full"        },
  [PublishedTripStatus.Confirmed]:  { [Language.FR]: "Confirmée", [Language.EN]: "Confirmed"   },
  [PublishedTripStatus.InProgress]: { [Language.FR]: "En cours",  [Language.EN]: "In Progress" },
  [PublishedTripStatus.Completed]:  { [Language.FR]: "Terminée",  [Language.EN]: "Completed"   },
  [PublishedTripStatus.Cancelled]:  { [Language.FR]: "Annulée",   [Language.EN]: "Cancelled"   },
  [PublishedTripStatus.NoShow]:     { [Language.FR]: "Absent",    [Language.EN]: "No Show"     },
};

// ─── LIBELLÉS LOCALISÉS — PASSAGER ────────────────────────────────────────────

/** Libellés bilingues des statuts de réservation pour le rôle passager */
export const PASSENGER_STATUS_LABELS: Record<string, Record<Language, string>> = {
  [ReservationStatus.Confirmed]:  { [Language.FR]: "Confirmée",  [Language.EN]: "Confirmed"   },
  [ReservationStatus.Pending]:    { [Language.FR]: "En attente", [Language.EN]: "Pending"     },
  [ReservationStatus.Cancelled]:  { [Language.FR]: "Annulée",    [Language.EN]: "Cancelled"   },
  [ReservationStatus.Completed]:  { [Language.FR]: "Terminée",   [Language.EN]: "Completed"   },
  [ReservationStatus.InProgress]: { [Language.FR]: "En cours",   [Language.EN]: "In Progress" },
};

// ─── LISTES DE VALEURS ────────────────────────────────────────────────────────

/** Toutes les valeurs de statut conducteur */
export const DRIVER_STATUSES    = Object.values(PublishedTripStatus) as string[];

/** Toutes les valeurs de statut passager */
export const PASSENGER_STATUSES = Object.values(ReservationStatus)   as string[];
