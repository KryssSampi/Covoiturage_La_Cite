"use client";

/**
 * Page Favoris — rôle Passager.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les données + callbacks à FavorisPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { FavorisPage } from "@/features/favoris";
import type { FavorisApiResponse, FavorisCallbacks } from "@/features/favoris/types/favoris.types";

export default function PassengerFavorisRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [data, setData] = useState<FavorisApiResponse | null>(null);

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
      const res = await fetch(`/api/favoris`, { credentials: 'same-origin' });
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("[passenger/favoris] loadData", error);
    }
  }, [user]);

  // Chargement initial\n  useEffect(() => {\n    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;\n    if (user.id !== params.id) return;\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    void loadData();\n  }, [loadData, params.id, user]);

  // Polling 30s — SSE db-watch désactivé (Server Core)
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const id = setInterval(() => { void loadData(); }, 30_000);
    return () => clearInterval(id);
  }, [user, params.id, loadData]);

  // ─── Callbacks CRUD ────────────────────────────────────────────────────

  const callbacks: FavorisCallbacks = {
    onAddLieu: useCallback(async (d) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch("/api/lieux-favoris", {
          method: "POST",
          credentials: 'same-origin',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(d),
        });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch (err) { console.error("[passenger/favoris/page]", err); }
      return { ok: false };
    }, [user, loadData]),

    onDeleteLieu: useCallback(async (id: string) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch(`/api/lieux-favoris?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: 'same-origin' });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch (err) { console.error("[passenger/favoris/page]", err); }
      return { ok: false };
    }, [user, loadData]),

    onAddUserFavori: useCallback(async (targetUserId: string) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch("/api/favoris/user-favori", {
          method: "POST",
          credentials: 'same-origin',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId }),
        });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch (err) { console.error("[passenger/favoris/page]", err); }
      return { ok: false };
    }, [user, loadData]),

    onDeleteUserFavori: useCallback(async (affiniteId: string) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch(`/api/favoris/user-favori?affiniteId=${encodeURIComponent(affiniteId)}`, { method: "DELETE", credentials: 'same-origin' });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch (err) { console.error("[passenger/favoris/page]", err); }
      return { ok: false };
    }, [user, loadData]),

    onToggleAlerte: useCallback(async (alerteId: string, newState: boolean) => {
      try {
        const res = await fetch("/api/favoris/alerte-toggle", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alerteId, surveyIsOn: newState }),
        });
        if (res.ok) return { ok: true };
      } catch (err) { console.error("[passenger/favoris/page]", err); }
      return { ok: false };
    }, []),

    onDeleteAlerte: useCallback(async (alerteId: string) => {
      try {
        const res = await fetch(`/api/favoris/alerte-toggle?alerteId=${encodeURIComponent(alerteId)}`, { method: "DELETE" });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch (err) { console.error("[passenger/favoris/page]", err); }
      return { ok: false };
    }, [loadData]),
  };

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <FavorisPage data={data} callbacks={callbacks} />;
}
