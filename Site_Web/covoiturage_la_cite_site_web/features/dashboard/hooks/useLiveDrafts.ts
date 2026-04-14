"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DraftTrip } from "@/features/brouillons/types";

interface UseLiveDraftsResult {
  drafts: DraftTrip[] | null;
  isLoading: boolean;
  error: string | null;
}

export function useLiveDrafts(): UseLiveDraftsResult {
  const [drafts, setDrafts] = useState<DraftTrip[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const draftsRef = useRef(drafts);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);

  const handleData = useCallback((rawDrafts: DraftTrip[]) => {
    const sorted = [...rawDrafts].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setDrafts(sorted);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchDrafts = async () => {
      try {
        const res = await fetch("/api/drafts");
        if (!res.ok) throw new Error("Echec de chargement des brouillons");
        const data: DraftTrip[] = await res.json();
        if (cancelled) return;
        handleData(data);
      } catch (err) {
        console.error("[useLiveDrafts] fetch", err);
        if (!draftsRef.current) {
          setError("Connexion au flux des brouillons interrompue.");
          setIsLoading(false);
        }
      }
    };

    void fetchDrafts();
    const intervalId = setInterval(() => { void fetchDrafts(); }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [handleData]);

  return { drafts, isLoading, error };
}