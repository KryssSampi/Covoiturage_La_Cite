import { isSameDay, startOfMonth, getDay, getDaysInMonth, addMonths } from "date-fns";
import {  MonthCell, StatusColors, Role, PublishedTripStatus, ReservationStatus } from "@/features/planner/types/calendar.types";
import { DRIVER_STATUS_COLORS, PASSENGER_STATUS_COLORS } from "@/features/planner/constants/calendar.constants";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";

// ─── STATUT → COULEUR ─────────────────────────────────────────────────────────

/**
 * Retourne les couleurs correspondant au statut d'un trajet
 * selon le rôle de l'utilisateur (conducteur ou passager).
 */
export function getStatusColor(status: string, role: string): StatusColors {
  return role === Role.DRIVER
    ? DRIVER_STATUS_COLORS[status] ?? DRIVER_STATUS_COLORS[PublishedTripStatus.Published]
    : PASSENGER_STATUS_COLORS[status] ?? PASSENGER_STATUS_COLORS[ReservationStatus.Pending];
}

// ─── SATURATION ───────────────────────────────────────────────────────────────

/**
 * Calcule une couleur HSLA de saturation pour une journée.
 * ratio = 0 → vert pastel, ratio = 1 → rouge pastel.
 */
export function getSaturationColor(ratio: number): string {
  const h = Math.round(142 - ratio * 142); // 142 = vert, 0 = rouge
  const s = 55 + ratio * 20;
  const l = 88 - ratio * 10;
  return `hsla(${h},${s}%,${l}%, 0.4)`;
}

// ─── FILTRAGE PAR DATE ────────────────────────────────────────────────────────

/**
 * Retourne tous les trajets correspondant à la date fournie.
 */
export function getRidesForDate(rides: (PublishedTrip | Reservation)[], date: Date): (PublishedTrip | Reservation)[] {
  return rides.filter((r) => isSameDay(r.date, date));
}

// ─── CALCUL DE SATURATION ────────────────────────────────────────────────────

/**
 * Calcule le taux de saturation d'une journée (entre 0 et 1)
 * en fonction du temps total occupé par les trajets (plage utile : 06h–23h).
 */
export function computeDaySaturation(rides: (PublishedTrip | Reservation)[], date: Date): number {
  const dayRides = getRidesForDate(rides, date);
  if (!dayRides.length) return 0;

  // Durée totale de la plage horaire utile (06h–23h = 17h × 60min)
  const USEFUL_MINUTES = 17 * 60;

  const occupied = dayRides.reduce((acc, r) => {
    return acc + (r.duration ?? 30); // Durée par défaut de 30 min si non fournie
  }, 0);

  return Math.min(1, occupied / USEFUL_MINUTES);
}

// ─── CONSTRUCTION DE LA GRILLE MENSUELLE ─────────────────────────────────────

/**
 * Construit le tableau de cellules pour un mois donné.
 * Inclut les jours du mois précédent (padding début) et suivant (padding fin)
 * pour compléter la grille à 7 colonnes.
 */
export function buildMonthCells(pivot: Date): MonthCell[] {
  const year     = pivot.getFullYear();
  const month    = pivot.getMonth();
  const total    = getDaysInMonth(pivot);
  const firstCol = getDay(startOfMonth(pivot)); // 0 = dimanche

  const cells: MonthCell[] = [];

  // Jours du mois précédent pour remplir le début de la grille
  const prevTotal = getDaysInMonth(addMonths(pivot, -1));
  for (let i = firstCol - 1; i >= 0; i--)
    cells.push({ day: prevTotal - i, month: month - 1, year, current: false });

  // Jours du mois courant
  for (let d = 1; d <= total; d++)
    cells.push({ day: d, month, year, current: true });

  // Jours du mois suivant pour compléter la dernière ligne
  const rem = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= rem; d++)
    cells.push({ day: d, month: month + 1, year, current: false });

  return cells;
}

// ─── CRÉNEAUX & INDISPONIBILITÉS ─────────────────────────────────────────────

/**
 * Vérifie si un créneau de 30 minutes (day, hour, minute) est occupé par un trajet.
 * Utilisé dans TimeCell pour déterminer si la case d'indisponibilité doit être affichée.
 *
 * @param rides  - Liste des trajets à tester
 * @param day    - Date du créneau
 * @param hour   - Heure du créneau (0-23)
 * @param minute - Minute du créneau (0 ou 30)
 */
export function hasRideInSlot(
  rides: (PublishedTrip | Reservation)[],
  day:   Date,
  hour:  number,
  minute: number
): boolean {
  const slotStart = new Date(day);
  slotStart.setHours(hour, minute, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

  return rides.some((r) => {
    // Normalise la date de début du trajet en objet Date
    const rideStart = r.date as string | Date instanceof Date ? r.date : new Date(r.date);

    // Calcule la fin du trajet : utilise 'end' si disponible, sinon date + durée (défaut 30 min)
    const rideEnd =
      "end" in r && r.end instanceof Date
        ? r.end
        : new Date((rideStart as Date).getTime() + (r.duration ?? 30) * 60 * 1000);

    return (
      isSameDay(rideStart, day) &&
      rideStart < slotEnd       &&
      rideEnd > slotStart
    );
  });
}
