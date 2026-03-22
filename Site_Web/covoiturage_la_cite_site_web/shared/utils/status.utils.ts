/**
 * @file status.utils.ts
 * @description Utilitaires partagés pour le formatage et les styles
 * des statuts de réservation et de trajet publié.
 *
 * Consolidé depuis :
 * - features/dashboard/components/passenger/reservations.section.tsx
 * - features/reservations/components/PassengerReservationsPage.tsx
 * - features/dashboard/hooks/usePublishedTrips.ts
 * - features/historique/components/DriverHistoriquePage.tsx
 */

import { Language } from "@/core/state/app_state";
import { ReservationStatus } from "@/features/dashboard/types/reservationStatus.types";
import { PublishedTripStatus } from "@/features/dashboard/types/publishedtripstatus.types";

// ─── Réservation — Libellés localisés ────────────────────────────────────────

/** Map statut réservation → libellés FR/EN */
const RESERVATION_STATUS_LABELS: Record<ReservationStatus, Record<Language, string>> = {
  [ReservationStatus.Confirmed]:  { [Language.FR]: "Confirmée",  [Language.EN]: "Confirmed"   },
  [ReservationStatus.Pending]:    { [Language.FR]: "En attente", [Language.EN]: "Pending"     },
  [ReservationStatus.Cancelled]:  { [Language.FR]: "Annulée",    [Language.EN]: "Cancelled"   },
  [ReservationStatus.Completed]:  { [Language.FR]: "Terminée",   [Language.EN]: "Completed"   },
  [ReservationStatus.InProgress]: { [Language.FR]: "En cours",   [Language.EN]: "In Progress" },
  [ReservationStatus.Rejected]:   { [Language.FR]: "Rejetée",    [Language.EN]: "Rejected"    },
};

/**
 * Retourne le libellé localisé d'un statut de réservation.
 */
export function getReservationStatusLabel(status: ReservationStatus, lang: Language): string {
  return RESERVATION_STATUS_LABELS[status]?.[lang] ?? status;
}

// ─── Réservation — Classes CSS Tailwind ──────────────────────────────────────

/** Map statut réservation → classes Tailwind du badge */
const RESERVATION_STATUS_CLASSES: Record<ReservationStatus, string> = {
  [ReservationStatus.Confirmed]:  "bg-green-400 text-white",
  [ReservationStatus.Pending]:    "bg-gray-600 text-white",
  [ReservationStatus.Cancelled]:  "bg-orange-400 text-white",
  [ReservationStatus.Completed]:  "bg-[#08316e] text-white",
  [ReservationStatus.InProgress]: "bg-red-400 text-white",
  [ReservationStatus.Rejected]:   "bg-yellow-500 text-white",
};

/**
 * Retourne les classes CSS Tailwind du badge d'un statut de réservation.
 */
export function getReservationStatusClasses(status: ReservationStatus): string {
  return RESERVATION_STATUS_CLASSES[status] ?? "bg-gray-400 text-white";
}

// ─── Trajet publié — Libellés localisés ──────────────────────────────────────

/** Map statut trajet publié → libellés FR/EN */
const PUBLISHED_TRIP_STATUS_LABELS: Record<PublishedTripStatus, Record<Language, string>> = {
  [PublishedTripStatus.Published]:  { [Language.FR]: "Publiée",   [Language.EN]: "Published"   },
  [PublishedTripStatus.Full]:       { [Language.FR]: "Complet",   [Language.EN]: "Full"        },
  [PublishedTripStatus.Confirmed]:  { [Language.FR]: "Confirmée", [Language.EN]: "Confirmed"   },
  [PublishedTripStatus.InProgress]: { [Language.FR]: "En cours",  [Language.EN]: "In Progress" },
  [PublishedTripStatus.Completed]:  { [Language.FR]: "Terminée",  [Language.EN]: "Completed"   },
  [PublishedTripStatus.Cancelled]:  { [Language.FR]: "Annulée",   [Language.EN]: "Cancelled"   },
  [PublishedTripStatus.NoShow]:     { [Language.FR]: "Absent",    [Language.EN]: "No Show"     },
};

/**
 * Retourne le libellé localisé d'un statut de trajet publié.
 */
export function getPublishedTripStatusLabel(status: PublishedTripStatus, lang: Language): string {
  return PUBLISHED_TRIP_STATUS_LABELS[status]?.[lang] ?? status;
}

// ─── Trajet publié — Classes CSS Tailwind ────────────────────────────────────

/** Map statut trajet publié → classes Tailwind du badge */
const PUBLISHED_TRIP_STATUS_COLORS: Record<PublishedTripStatus, string> = {
  [PublishedTripStatus.Published]:  "bg-gray-400 text-white",
  [PublishedTripStatus.Full]:       "bg-yellow-400 text-white",
  [PublishedTripStatus.Confirmed]:  "bg-green-400 text-white",
  [PublishedTripStatus.InProgress]: "bg-red-400 text-white",
  [PublishedTripStatus.Completed]:  "bg-[#08316e] text-white",
  [PublishedTripStatus.Cancelled]:  "bg-orange-400 text-white",
  [PublishedTripStatus.NoShow]:     "bg-gray-400 text-white",
};

/**
 * Retourne les classes CSS Tailwind du badge d'un statut de trajet publié.
 */
export function getPublishedTripStatusColor(status: PublishedTripStatus): string {
  return PUBLISHED_TRIP_STATUS_COLORS[status] ?? "bg-gray-400 text-white";
}
