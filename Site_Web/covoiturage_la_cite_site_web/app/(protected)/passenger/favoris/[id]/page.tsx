"use client";

/**
 * Page Favoris — rôle Passager.
 * Même page que le conducteur (indépendant du rôle).
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { FavorisPage } from "@/features/favoris";

export default function PassengerFavorisRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

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

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <FavorisPage />;
}
