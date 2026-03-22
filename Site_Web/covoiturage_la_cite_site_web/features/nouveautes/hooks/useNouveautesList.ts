"use client";

/**
 * Hook gérant la configuration ListDetailPage pour les nouveautés (vidéos YouTube).
 * Commun aux deux rôles. Mappe les données NouveauteVideo avec un id pour ListDetailPage.
 *
 * TODO (optionnel): Remplacer NOUVEAUTE_VIDEOS par GET /api/admin/nouveautes
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { NOUVEAUTE_VIDEOS, NouveauteVideo } from "@/tests/fixtures/dashboard/nouveautes.fixtures";

// Type étendu avec un id pour satisfaire la contrainte ListDetailPage
export type NouveauteItem = NouveauteVideo & { id: string };

export function useNouveautesList() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Ajout d'un id basé sur youtubeId (unique) pour ListDetailPage
  const items: NouveauteItem[] = useMemo(
    () => NOUVEAUTE_VIDEOS.map((v) => ({ ...v, id: v.youtubeId })),
    [],
  );

  // Recherche sur le titre de la vidéo
  const searchKeys = ["title"];

  const emptyMessage = isFR
    ? "Aucune nouveauté pour le moment."
    : "No new features yet.";

  return { items, searchKeys, emptyMessage };
}
