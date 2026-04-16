"use client";

/**
 * Page Finances — rôle Passager.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les données assemblées à FinancesPage (composant pur).
 * Masque la section retrait et le bouton Retirer (inutiles pour un passager).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { FinancesPage } from "@/features/finances";
import { useFinances } from "@/features/finances/hooks/useFinances";
import type { FinancesApiResponse } from "@/features/finances/types/finances.types";

export default function PassengerFinancesRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  // ─── État : période + données ──────────────────────────────────────────
  const { periode, setPeriode, periodes } = useFinances();
  const [data, setData] = useState<FinancesApiResponse | null>(null);

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

  // Chargement des données depuis l'API (inclut la période active)
  const loadData = useCallback(async (p: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/finances?role=passenger&periode=${encodeURIComponent(p)}`,
        { credentials: 'same-origin' },
      );
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("[passenger/finances] loadData", error);
    }
  }, [user]);

// Chargement initial + rechargement quand la période change\n  useEffect(() => {\n    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;\n    if (user.id !== params.id) return;\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    void loadData(periode);\n  }, [loadData, params.id, user, periode]);

  // SSE : mise à jour temps réel lorsque les finances changent
  // Polling 30s — db-watch SSE désactivé (503)
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const id = setInterval(() => void loadData(periode), 30_000);
    return () => clearInterval(id);
  }, [user, params.id, loadData, periode]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return (
    <FinancesPage
      role="passenger"
      data={data}
      periode={periode}
      onPeriodeChange={setPeriode}
      periodes={periodes}
    />
  );
}
