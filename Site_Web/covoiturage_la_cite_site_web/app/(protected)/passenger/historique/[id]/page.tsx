"use client";

/**
 * Page d'historique des trajets — rôle Passager.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à PassengerHistoriquePage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { PassengerHistoriquePage } from "@/features/historique";
import type { Trip } from "@/features/dashboard/types/trip.types";

export default function PassengerHistoriqueRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [items, setItems] = useState<Trip[]>([]);

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

  // Chargement des données depuis l'API dédiée (montage backend)
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/passenger/historique');
      if (!res.ok) return;
      setItems(await res.json());
    } catch (error) {
      console.error("[passenger/historique] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les réservations changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    // SSE endpoint /api/sse/db-watch/* is deprecated and returns 503.
    // Use a light polling fallback to avoid calling the disabled SSE route.
    const interval = setInterval(() => {
      void loadData();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <PassengerHistoriquePage items={items} />;
}
