"use client";

/**
 * Page Statistiques — rôle Conducteur.
 * Récupère les données via API et passe les données à StatistiquesPage (composant pur).
 * FIX: useEffect de chargement initial correctement déclaré.
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

  // Chargement des données
  const loadData = useCallback(async (p: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/statistiques?periode=${encodeURIComponent(p)}`,
        { credentials: 'same-origin' },
      );
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("[driver/statistiques] loadData", error);
    }
  }, [user]);

  // Chargement initial + rechargement quand la période change — FIX: useEffect correctement déclaré
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData(periode);
  }, [loadData, params.id, user, periode]);

  // Polling 60s
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
