"use client";

/**
 * Page des brouillons de trajets — rôle Conducteur uniquement.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à BrouillonsPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { BrouillonsPage } from "@/features/brouillons";
import type { DraftTrip } from "@/features/brouillons/types";

export default function BrouillonsRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;
  const [items, setItems]   = useState<DraftTrip[]>([]);

  // Vérification rôle conducteur + identité
  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  // Chargement des brouillons depuis l'API
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/drafts');
      if (!res.ok) return;
      const drafts: DraftTrip[] = await res.json();
      setItems(drafts);
    } catch (error) {
      console.error("[driver/brouillons] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les brouillons changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const es = new EventSource("/api/sse/db-watch/drafts");
    let isFirst = true;
    es.addEventListener("update", () => {
      if (isFirst) { isFirst = false; return; }
      void loadData();
    });
    return () => es.close();
  }, [user, params.id, loadData]);

  // Suppression d'un brouillon via l'API
  const handleRemove = useCallback(async (id: string) => {
    try {
      await fetch(`/api/drafts/${encodeURIComponent(id)}`, { method: "DELETE" });
      // Le SSE déclenchera le rechargement automatique
    } catch (error) {
      console.error("[driver/brouillons] handleRemove", error);
    }
  }, []);

  return <BrouillonsPage items={items} onRemove={handleRemove} />;
}
