"use client";

/**
 * Page Statistiques — rôle Conducteur.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les données assemblées à StatistiquesPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { StatistiquesPage } from "@/features/statistiques";
import { useStatistiques } from "@/features/statistiques/hooks/useStatistiques";
import type { StatistiquesPageModel } from "@/features/statistiques/types/statistiques.types";

export default function DriverStatistiquesRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const { periode, setPeriode, periodes } = useStatistiques();
  const [data, setData] = useState<StatistiquesPageModel | null>(null);

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

  // Chargement des données depuis l'API (inclut la période active)
  const loadData = useCallback(async (p: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/statistiques?userId=${encodeURIComponent(user.id)}&periode=${encodeURIComponent(p)}`,
      );
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("[driver/statistiques] loadData", error);
    }
  }, [user]);

  // Chargement initial + rechargement quand la période change
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;
    void loadData(periode);
  }, [loadData, params.id, user, periode]);

  // Polling 60s — SSE db-watch désactivé (Server Core)
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const id = setInterval(() => { void loadData(periode); }, 60_000);
    return () => clearInterval(id);
  }, [user, params.id, loadData, periode]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;
  if (!data) return null;

  return (
    <StatistiquesPage
      data={data}
      periode={periode}
      onPeriodeChange={setPeriode}
      periodes={periodes}
    />
  );
}
