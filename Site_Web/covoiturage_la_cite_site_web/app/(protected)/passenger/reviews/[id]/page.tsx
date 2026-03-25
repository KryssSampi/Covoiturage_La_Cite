"use client";

/**
 * Page des avis reçus — rôle Passager.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à ReviewsPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { ReviewsPage } from "@/features/reviews";
import type { Review } from "@/features/dashboard/types";

export default function PassengerReviewsRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;
  const [items, setItems]   = useState<Review[]>([]);

  // Vérification rôle / identité
  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  // Chargement des avis depuis l'API dédiée (montage backend)
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/reviews/enriched?revieweeId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      setItems(await res.json());
    } catch (error) {
      console.error("[passenger/reviews] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les avis changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const es = new EventSource("/api/sse/db-watch/reviews");
    let isFirst = true;
    es.addEventListener("update", () => {
      if (isFirst) { isFirst = false; return; }
      void loadData();
    });
    return () => es.close();
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <ReviewsPage items={items} />;
}
