"use client";

/**
 * Page Favoris — rôle Conducteur.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les données + callbacks à FavorisPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { FavorisPage } from "@/features/favoris";
import type { FavorisApiResponse, FavorisCallbacks } from "@/features/favoris/types/favoris.types";

export default function DriverFavorisRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [data, setData] = useState<FavorisApiResponse | null>(null);

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

  // Chargement des données depuis l'API
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/favoris?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      setData(await res.json());
    } catch (error) {
      console.error("[driver/favoris] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les favoris changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const entities = ["lieux_favoris", "affinites"];
    const sources = entities.map((entity) => {
      const es = new EventSource(`/api/sse/db-watch/${entity}`);
      let isFirst = true;
      es.addEventListener("update", () => {
        if (isFirst) { isFirst = false; return; }
        void loadData();
      });
      return es;
    });
    return () => sources.forEach((es) => es.close());
  }, [user, params.id, loadData]);

  // ─── Callbacks CRUD ────────────────────────────────────────────────────

  const callbacks: FavorisCallbacks = {
    onAddLieu: useCallback(async (d) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch("/api/lieux-favoris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, userId: user.id }),
        });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch { /* ignore */ }
      return { ok: false };
    }, [user, loadData]),

    onDeleteLieu: useCallback(async (id: string) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch(`/api/lieux-favoris?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(user.id)}`, { method: "DELETE" });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch { /* ignore */ }
      return { ok: false };
    }, [user, loadData]),

    onAddUserFavori: useCallback(async (targetUserId: string) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch("/api/favoris/user-favori", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, targetUserId }),
        });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch { /* ignore */ }
      return { ok: false };
    }, [user, loadData]),

    onDeleteUserFavori: useCallback(async (affiniteId: string) => {
      if (!user) return { ok: false };
      try {
        const res = await fetch(`/api/favoris/user-favori?affiniteId=${encodeURIComponent(affiniteId)}`, { method: "DELETE" });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch { /* ignore */ }
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
      } catch { /* ignore */ }
      return { ok: false };
    }, []),

    onDeleteAlerte: useCallback(async (alerteId: string) => {
      try {
        const res = await fetch(`/api/favoris/alerte-toggle?alerteId=${encodeURIComponent(alerteId)}`, { method: "DELETE" });
        if (res.ok) { void loadData(); return { ok: true }; }
      } catch { /* ignore */ }
      return { ok: false };
    }, [loadData]),
  };

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;

  return <FavorisPage data={data} callbacks={callbacks} />;
}
