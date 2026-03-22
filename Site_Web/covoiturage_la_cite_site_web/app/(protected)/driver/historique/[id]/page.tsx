"use client";

/**
 * Page d'historique des trajets publiés — rôle Conducteur.
 * Affiche la liste des trajets publiés via ListDetailPage.
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { DriverHistoriquePage } from "@/features/historique";

export default function DriverHistoriqueRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

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

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;

  return <DriverHistoriquePage />;
}
