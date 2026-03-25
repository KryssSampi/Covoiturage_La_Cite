"use client";

/**
 * Hook de configuration ListDetailPage pour les nouveautés (vidéos).
 * Commun aux deux rôles. Fournit uniquement clés de recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { Language, useAppState } from "@/core/state/app_state";

export function useNouveautesConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  const searchKeys = ["title"];

  const emptyMessage = isFR
    ? "Aucune nouveauté pour le moment."
    : "No new features yet.";

  return { searchKeys, emptyMessage };
}
