// Fonctions pures extraites de useSuperSearch — aucun état React
import { format, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

// ── Conversion temps ↔ minutes ──────────────────────────────────────────────

/** Convertit "HH:mm" en nombre total de minutes */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Convertit un nombre de minutes en "HH:mm" (modulo 24h) */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Label date localisé ─────────────────────────────────────────────────────

/** Retourne "Aujourd'hui", "Demain" ou la date formatée selon la langue */
export function getDateLabel(date: Date, isFR: boolean): string {
  if (isToday(date)) return isFR ? "Aujourd'hui" : "Today";
  if (isTomorrow(date)) return isFR ? "Demain" : "Tomorrow";
  return format(date, "dd MMMM yyyy", { locale: isFR ? fr : undefined });
}

// ── Messages d'erreur géolocalisation ───────────────────────────────────────

/** Messages bilingues pour chaque code d'erreur GeolocationPositionError */
export const GEOLOCATION_ERROR_MESSAGES: Record<number, { fr: string; en: string }> = {
  1: { // PERMISSION_DENIED
    fr: "Accès à la localisation refusé. Vérifiez les permissions de votre navigateur.",
    en: "Location access denied. Please check your browser permissions.",
  },
  2: { // POSITION_UNAVAILABLE
    fr: "Position indisponible. Vérifiez votre connexion GPS.",
    en: "Position unavailable. Please check your GPS connection.",
  },
  3: { // TIMEOUT
    fr: "Délai de localisation dépassé. Réessayez ou saisissez l'adresse manuellement.",
    en: "Location timed out. Please retry or enter the address manually.",
  },
};
