"use client";

/**
 * @file useLiveDrafts.ts
 * @description Hook SSE pour les brouillons de trajet en temps réel.
 *
 * Fonctionnement :
 * 1. Ouvre une connexion SSE vers /api/sse/db-watch/drafts
 * 2. Reçoit le contenu initial + chaque modification du fichier JSON
 *    (créations via QuickPlan, éditions manuelles du fichier)
 * 3. Les brouillons ne sont pas filtrés par conducteur —
 *    ils apparaissent pour tous les conducteurs
 * 4. Triés par updatedAt décroissant (plus récents en premier)
 *
 * @returns { drafts, isLoading, error }
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { DraftTrip } from "@/features/brouillons/types";

interface UseLiveDraftsResult {
  /** Liste des brouillons — null avant le premier message SSE */
  drafts: DraftTrip[] | null;
  /** Vrai uniquement avant le premier message du serveur */
  isLoading: boolean;
  /** Message d'erreur si la connexion SSE a échoué */
  error: string | null;
}

export function useLiveDrafts(): UseLiveDraftsResult {
  const [drafts, setDrafts] = useState<DraftTrip[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Référence vers la connexion SSE active
  const esRef = useRef<EventSource | null>(null);
  // Ref pour vérifier si on a déjà reçu des données
  const draftsRef = useRef(drafts);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);

  /**
   * Traite les données brutes reçues via SSE et les trie par date décroissante.
   */
  const handleData = useCallback((rawDrafts: DraftTrip[]) => {
    // Tri par date de mise à jour décroissante
    const sorted = [...rawDrafts].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setDrafts(sorted);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    // Ouverture de la connexion SSE vers le flux de surveillance des brouillons
    const es = new EventSource("/api/sse/db-watch/drafts");
    esRef.current = es;

    // Réception d'un événement 'update' (contenu initial ou modification)
    es.addEventListener("update", (event) => {
      try {
        const data: DraftTrip[] = JSON.parse(event.data);
        handleData(data);
      } catch {
        console.error("[useLiveDrafts] Erreur de parsing SSE");
      }
    });

    // Gestion des erreurs SSE
    es.addEventListener("error", () => {
      if (!draftsRef.current) {
        setError("Connexion au flux des brouillons interrompue. Reconnexion en cours…");
        setIsLoading(false);
      }
    });

    // Nettoyage : fermeture propre de la connexion SSE
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [handleData]);

  return { drafts, isLoading, error };
}
