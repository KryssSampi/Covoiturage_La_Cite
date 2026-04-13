/**
 * @file date.utils.ts
 * @description Utilitaire de formatage de date avancé pour les trajets.
 * Gère passé ET futur avec support semaines, mois, années.
 *
 * Distinct de formatRelativeDate qui ne gère que le passé
 * et sert aux avis/notifications. Celui-ci sert aux trajets du conducteur
 * (QuickPlan, PublishedTrips, ReservationRequests) où les dates futures
 * sont courantes (trajet planifié pour demain, la semaine prochaine...).
 *
 * Utilisé par : QuickPlanSection, PublishedTripCard, ReservationRequestCard
 *
 * @example
 * formatDate("2026-03-01", Language.FR) // → "Dans 7 jours"
 * formatDate("2026-02-21", Language.FR) // → "Hier"
 * formatDate("2026-02-22", Language.FR) // → "Aujourd'hui"
 */

import { Language } from "@/core/state/app_state";

const MS_PER_DAY = 1_000 * 60 * 60 * 24;

/**
 * Formate une date en libellé relatif bilingue (passé ET futur).
 *
 * Règles :
 * - Aujourd'hui               → "Aujourd'hui" / "Today"
 * - Hier / Demain             → "Hier"/"Yesterday" | "Demain"/"Tomorrow"
 * - < 7 jours                 → nom du jour de la semaine (ex: "Lundi")
 * - < 30 jours                → "Il y a X semaines" / "Dans X semaines"
 * - < 12 mois                 → "Il y a X mois" / "Dans X mois"
 * - ≥ 12 mois                 → "Il y a X ans" / "Dans X ans"
 *
 * @param dateString Date au format ISO "YYYY-MM-DD" ou ISO string complet
 * @param lang Langue courante de l'application (Language.FR | Language.EN)
 * @param time Heure optionnelle "HH:mm" — si fournie, la comparaison utilise le datetime absolu
 * @returns Chaîne localisée prête à l'affichage
 */
export function formatDate(dateString: string, lang: Language, time?: string): string {
  if (!dateString) return "";

  const date = parseDisplayDate(dateString);
  const now = new Date();
  const locale = lang === Language.FR ? "fr-FR" : "en-US";

  // Si l'heure est fournie, on compare le datetime absolu (jour + heure)
  // pour éviter qu'un trajet imminent (ex: 00h30 demain, dans 1h) affiche « Demain »
  if (time) {
    const [h, m] = time.split(":").map(Number);
    // Interpréter l'heure fournie comme UTC pour rester cohérent
    // avec le backend / BFF qui envoie les heures en UTC.
    let departure = new Date(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(h)}:${pad(m)}:00Z`);

    // Si la construction UTC a échoué (date invalide), retomber sur la construction locale
    if (isNaN(departure.getTime())) {
      departure = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
    }

    const diffMs = departure.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Départ dans les 2 prochaines heures → « Imminent »
    if (diffHours >= 0 && diffHours <= 2) {
      return lang === Language.FR ? "Imminent" : "Imminent";
    }
    // Départ dans les 12 prochaines heures → « Aujourd'hui » même si jour calendrier = demain
    if (diffHours > 0 && diffHours <= 12) {
      return lang === Language.FR ? "Aujourd'hui" : "Today";
    }
  }

  // Normalisation à minuit pour éviter les décalages d'heure locale
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate  = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / MS_PER_DAY,
  );
  const isFuture = diffDays < 0;
  const absDays  = Math.abs(diffDays);

  // ── Aujourd'hui ───────────────────────────────────────────────────────────
  if (absDays === 0) return lang === Language.FR ? "Aujourd'hui" : "Today";

  // ── Hier / Demain ─────────────────────────────────────────────────────────
  if (absDays === 1) {
    if (isFuture) return lang === Language.FR ? "Demain" : "Tomorrow";
    return lang === Language.FR ? "Hier" : "Yesterday";
  }

  // ── < 7 jours → nom du jour ───────────────────────────────────────────────
  if (absDays < 7) {
    return date.toLocaleDateString(locale, { weekday: "long" });
  }

  // ── < 30 jours → semaines ─────────────────────────────────────────────────
  if (absDays < 30) {
    const weeks = Math.floor(absDays / 7);
    const plural = weeks > 1 ? "s" : "";
    if (isFuture) {
      return lang === Language.FR
        ? `Dans ${weeks} semaine${plural}`
        : `In ${weeks} week${plural}`;
    }
    return lang === Language.FR
      ? `Il y a ${weeks} semaine${plural}`
      : `${weeks} week${plural} ago`;
  }

  // ── Mois / Années ─────────────────────────────────────────────────────────
  const yearDiff  = now.getFullYear() - date.getFullYear();
  const monthDiff = yearDiff * 12 + (now.getMonth() - date.getMonth());
  const absMonths = Math.abs(monthDiff);

  if (absMonths < 12) {
    if (isFuture) {
      return lang === Language.FR
        ? `Dans ${absMonths} mois`
        : `In ${absMonths} month${absMonths > 1 ? "s" : ""}`;
    }
    return lang === Language.FR
      ? `Il y a ${absMonths} mois`
      : `${absMonths} month${absMonths > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(absMonths / 12);
  if (isFuture) {
    return lang === Language.FR
      ? `Dans ${years} an${years > 1 ? "s" : ""}`
      : `In ${years} year${years > 1 ? "s" : ""}`;
  }
  return lang === Language.FR
    ? `Il y a ${years} an${years > 1 ? "s" : ""}`
    : `${years} year${years > 1 ? "s" : ""} ago`;
}

function parseDisplayDate(dateString: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateString);
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers UTC → local
// ──────────────────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * Retourne la date locale (ISO YYYY-MM-DD) correspondant au couple UTC
 * fourni par le serveur.
 */
export function utcToLocalDateIso(utcDate: string, utcTime: string): string {
  try {
    const dt = new Date(`${utcDate}T${utcTime}:00Z`);
    if (isNaN(dt.getTime())) return utcDate;
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  } catch {
    return utcDate;
  }
}

/**
 * Retourne l'heure locale formatée `HH:mm` pour affichage.
 */
export function utcToLocalTime(utcDate: string, utcTime: string): string {
  try {
    const dt = new Date(`${utcDate}T${utcTime}:00Z`);
    if (isNaN(dt.getTime())) return utcTime ?? '';
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    return `${hh}:${mm}`;
  } catch {
    return utcTime;
  }
}

export function utcToLocalDate(utcDate: string, utcTime: string): string {
  try {
    const dt = new Date(`${utcDate}T${utcTime}:00Z`);
    if (isNaN(dt.getTime())) return utcDate;
    return dt.toLocaleDateString();
  } catch {
    return utcDate;
  }
}
