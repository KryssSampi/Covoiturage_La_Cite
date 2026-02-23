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
 * @returns Chaîne localisée prête à l'affichage
 */
export function formatDate(dateString: string, lang: Language): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const locale = lang === Language.FR ? "fr-FR" : "en-US";

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
