"use client";

/**
 * @file useDrafts.ts
 * @description Hook principal de la feature brouillons.
 *
 * Charge les brouillons depuis la base JSON via /api/drafts?driverId=...
 * Persiste chaque sauvegarde et suppression via les routes API.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { DraftTrip } from "@/features/brouillons/types";
import type { SortOption } from "@/shared/components/list-detail-page";
import { useAppState } from "@/core/state/app_state";

// ─── Options de tri ──────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
  {
    value: "recent",
    label: "Plus récent",
    compareFn: <T,>(a: T, b: T) =>
      new Date((b as unknown as DraftTrip).updatedAt).getTime() -
      new Date((a as unknown as DraftTrip).updatedAt).getTime(),
  },
  {
    value: "oldest",
    label: "Plus ancien",
    compareFn: <T,>(a: T, b: T) =>
      new Date((a as unknown as DraftTrip).updatedAt).getTime() -
      new Date((b as unknown as DraftTrip).updatedAt).getTime(),
  },
];

// ─── Clés de recherche ───────────────────────────────────────────────────────

const SEARCH_KEYS: string[] = [
  "departureLocation",
  "arrivalLocation",
  "notes",
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseDraftsReturn {
  drafts:       DraftTrip[];
  sortOptions:  SortOption[];
  searchKeys:   string[];
  emptyMessage: string;
  /** Ajoute ou met à jour un brouillon (persiste via API) */
  saveDraft:    (draft: DraftTrip) => void;
  /** Supprime un brouillon par id (persiste via API) */
  removeDraft:  (id: string) => void;
}

export function useDrafts(): UseDraftsReturn {
  const { userConnected } = useAppState();
  const [drafts, setDrafts] = useState<DraftTrip[]>([]);

  // Chargement initial depuis la base JSON
  useEffect(() => {
    if (!userConnected?.id) return;
    fetch(`/api/drafts?driverId=${userConnected.id}`)
      .then((r) => r.json())
      .then((data: DraftTrip[]) => setDrafts(data))
      .catch(() => setDrafts([]));
  }, [userConnected?.id]);

  // Écoute l'événement « draft:save » émis par useCreateTrip
  useEffect(() => {
    const handler = (e: Event) => {
      const draft = (e as CustomEvent<DraftTrip>).detail;
      setDrafts((prev) => {
        const idx = prev.findIndex((d) => d.id === draft.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = draft;
          return next;
        }
        return [draft, ...prev];
      });
    };
    window.addEventListener("draft:save", handler);
    return () => window.removeEventListener("draft:save", handler);
  }, []);

  // Ajout ou mise à jour d'un brouillon (persiste via API)
  const saveDraft = useCallback((draft: DraftTrip) => {
    const draftWithDriver: DraftTrip = {
      ...draft,
      driverId: draft.driverId ?? userConnected?.id,
    };

    // Appel API (fire-and-forget — la liste locale est mise à jour immédiatement)
    fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(draftWithDriver),
    }).catch(() => {/* Echec silencieux côté UI */});

    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === draftWithDriver.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = draftWithDriver;
        return next;
      }
      return [draftWithDriver, ...prev];
    });
  }, [userConnected?.id]);

  // Suppression d'un brouillon (persiste via API)
  const removeDraft = useCallback((id: string) => {
    fetch(`/api/drafts/${id}`, { method: 'DELETE' }).catch(() => {/* Echec silencieux */});
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const emptyMessage = useMemo(
    () => "Vous n\u2019avez aucun brouillon pour le moment.",
    [],
  );

  return {
    drafts,
    sortOptions: SORT_OPTIONS,
    searchKeys:  SEARCH_KEYS,
    emptyMessage,
    saveDraft,
    removeDraft,
  };
}
