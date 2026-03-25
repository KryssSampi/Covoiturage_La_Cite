"use client";

/**
 * Page Go! Board — rôle Passager.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les données à GoBoardPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { GoBoardPage } from "@/features/goboard";
import type { GoBoardApiResponse } from "@/features/goboard/types/goboard.types";

export default function PassengerGoBoardRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [data, setData] = useState<GoBoardApiResponse | null>(null);

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

  // Chargement des données depuis l'API
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/goboard?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("[passenger/goboard] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les données GoBoard changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const entities = ["gotasks", "goevents", "goboard_classement", "eco_challenges"];
    const sources = entities.map((entity) => {
      const es = new EventSource(`/api/sse/db-watch/${entity}`);
      let isFirst = true;
      es.addEventListener("update", () => {
        // Ignorer le premier événement (état initial)
        if (isFirst) { isFirst = false; return; }
        void loadData();
      });
      return es;
    });
    return () => sources.forEach((es) => es.close());
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;
  if (!data) return null;

  return <GoBoardPage data={data} />;
}
