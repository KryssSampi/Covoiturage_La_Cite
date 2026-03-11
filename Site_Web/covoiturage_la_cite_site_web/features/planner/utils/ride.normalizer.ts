import { PublishedTrip } from "@/features/dashboard/types/publishedtrip.types";
import { Reservation }   from "@/features/dashboard/types/reservation.types";

// ─── DURÉE PAR DÉFAUT ─────────────────────────────────────────────────────────

/** Durée appliquée lorsque le champ `duration` est null (en minutes) */
const FALLBACK_DURATION_MIN = 30;

// ─── INTERFACE NORMALISÉE ─────────────────────────────────────────────────────

/**
 * Représentation unifiée d'un trajet, indépendante du type source.
 * Utilisée par les composants du planificateur (ex. RideCell) pour un
 * accès uniforme aux propriétés essentielles.
 */
export interface NormalizedRide {
  /** Date/heure de départ */
  start: Date;
  /** Date/heure d'arrivée estimée */
  end: Date;
  /** Ville ou adresse de départ */
  origin: string;
  /** Ville ou adresse d'arrivée */
  destination: string;
  /** Statut courant du trajet (ex. "active", "pending", "done") */
  status: string;
}

// ─── NORMALIZER ───────────────────────────────────────────────────────────────

/**
 * Normalise un `PublishedTrip` ou une `Reservation` vers `NormalizedRide`.
 *
 * Les deux types partagent les mêmes champs source :
 *   - `date`        → "YYYY-MM-DD"
 *   - `time`        → "HH:mm"
 *   - `duration`    → minutes (ou null)
 *   - `departure`   → origine
 *   - `destination` → destination
 *   - `status`      → statut
 *
 * @param ride - Trajet publié ou réservation à normaliser
 * @returns    Objet `NormalizedRide` prêt à l'emploi
 */
export function normalizeRide(ride: PublishedTrip | Reservation): NormalizedRide {
  // Construction de la date de départ à partir des champs `date` et `time`
  const start = parseRideDateTime(ride.date, ride.time);

  // Calcul de la date d'arrivée selon la durée (fallback si null)
  const durationMin = ride.duration ?? FALLBACK_DURATION_MIN;
  const end = new Date(start.getTime() + durationMin * 60_000);

  return {
    start,
    end,
    origin:      ride.departure,
    destination: ride.destination,
    status:      ride.status,
  };
}

// ─── UTILITAIRE INTERNE ───────────────────────────────────────────────────────

/**
 * Construit un objet `Date` valide à partir du champ `date` et du champ `time`.
 *
 * Cas gérés :
 *  1. `date` est déjà un ISO datetime complet (ex. "2026-03-01T08:30:00.000Z")
 *     → utilisé directement, `time` est ignoré
 *  2. `date` est une date seule "YYYY-MM-DD" + `time` au format "HH:mm" ou "HH:mm:ss"
 *     → concaténation en "YYYY-MM-DDTHH:mm:00"
 *  3. `time` est null/undefined/vide
 *     → minuit (00:00) appliqué par défaut
 *  4. Date toujours invalide après tentatives
 *     → fallback sur now() avec un warning console
 *
 * @param date - Champ date du trajet (ISO string ou "YYYY-MM-DD")
 * @param time - Champ heure du trajet ("HH:mm", "HH:mm:ss" ou null/undefined)
 * @returns    Objet `Date` valide
 */
function parseRideDateTime(date: string, time: string | null | undefined): Date {
  // Cas 1 : `date` contient déjà un composant horaire (ISO complet)
  if (date && date.includes("T")) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d;
  }

  // Cas 2 : concaténation date + heure
  if (date && time) {
    // Normalise l'heure à "HH:mm" (coupe les secondes si présentes)
    const normalizedTime = time.slice(0, 5);
    const d = new Date(`${date}T${normalizedTime}:00`);
    if (!isNaN(d.getTime())) return d;
  }

  // Cas 3 : `time` absent — minuit sur la date fournie
  if (date) {
    // Extrait uniquement la partie date pour éviter les décalages UTC
    const datePart = date.slice(0, 10);
    const d = new Date(`${datePart}T00:00:00`);
    if (!isNaN(d.getTime())) return d;
  }

  // Cas 4 : fallback ultime
  console.warn("[ride.normalizer] Date invalide — date:", date, "time:", time, "→ fallback sur now()");
  return new Date();
}
