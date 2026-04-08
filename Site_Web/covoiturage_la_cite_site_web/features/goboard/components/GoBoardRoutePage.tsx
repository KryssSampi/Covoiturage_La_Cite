"use client";

/**
 * Composant partagé pour les pages GoBoard (driver & passenger).
 * Gère la vérification de rôle, le chargement des données et les SSE.
 * Les deux pages driver et passenger utilisent ce même composant.
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { GoBoardPage } from "@/features/goboard";
import type { GoBoardApiResponse } from "@/features/goboard/types/goboard.types";

interface GoBoardRoutePageProps {
  expectedRole: "driver" | "passenger";
}

export function GoBoardRoutePage({ expectedRole }: GoBoardRoutePageProps) {
  const appState = useAppState();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;

  const [data, setData] = useState<GoBoardApiResponse | null>(null);

  // Vérification rôle / identité
  useEffect(() => {
    const userRole = user?.role?.toString().toLowerCase();
    if (user?.id !== params.id || userRole !== expectedRole) {
      setActiveLoader(true);
      router.push(`/${userRole ?? "driver"}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader, expectedRole]);

  // Chargement des données depuis l'API
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/goboard");
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error(`[${expectedRole}/goboard] loadData`, error);
    }
  }, [user, expectedRole]);

  // Chargement initial
  useEffect(() => {
    const userRole = user?.role?.toString().toLowerCase();
    if (!user || userRole !== expectedRole) return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user, expectedRole]);

  // SSE : mise à jour temps réel
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const entities = ["gotasks", "goevents", "goboard_classement", "eco_challenges"];
    const sources = entities.map((entity) => {
      const es = new EventSource(`/api/sse/db-watch/${entity}`);
      // K-5: SSE remplacé par polling — les EventSource retournent 503
      // On utilise un polling à la place
      return { es, intervalId: setInterval(() => void loadData(), 30_000) };
    });
    return () => sources.forEach(({ es, intervalId }) => {
      es.close();
      clearInterval(intervalId);
    });
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== expectedRole) return null;
  if (!data) return null;

  return <GoBoardPage data={data} />;
}