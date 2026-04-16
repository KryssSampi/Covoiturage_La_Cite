"use client";

/**
 * Page d'historique des trajets publiés — rôle Conducteur.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à DriverHistoriquePage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { DriverHistoriquePage } from "@/features/historique";
import type { PublishedTrip } from "@/features/dashboard/types";

export default function DriverHistoriqueRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [items, setItems] = useState<PublishedTrip[]>([]);

  // Vérification rôle / identité
  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") {
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
      const res = await fetch(`/api/driver/historique?driverId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      setItems(await res.json());
    } catch (error) {
      console.error("[driver/historique] loadData", error);
    }
  }, [user]);

  // Chargement initial\n  useEffect(() => {\n    if (!user || user.role?.toString().toLowerCase() !== "driver") return;\n    if (user.id !== params.id) return;\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    void loadData();\n  }, [loadData, params.id, user]);

  // Polling 30s — db-watch SSE désactivé (503)
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const id = setInterval(() => void loadData(), 30_000);
    return () => clearInterval(id);
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;

  return <DriverHistoriquePage items={items} />;
}
