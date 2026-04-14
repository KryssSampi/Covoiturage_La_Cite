"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { NotificationsPage } from "@/features/notifications";
import type { NotificationModel } from "@/core/models/NotificationModel";

export default function PassengerNotificationsRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;
  const [items, setItems]   = useState<NotificationModel[]>([]);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // Vérification rôle / identité
  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const t = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(t);
    }
  }, [user, params, router, setActiveLoader]);

  // Chargement initial + rechargement
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger" || user.id !== params.id) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch(`/api/notifications`, { credentials: 'same-origin' });
        if (!res.ok || cancelled) return;
        const data: NotificationModel[] = await res.json();
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error("[passenger/notifications] fetchData", err);
      }
    }
    void fetchData();
    return () => { cancelled = true; };
  }, [user, params.id, version]);

  // Polling 30s (remplacement SSE db-watch 503)
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const intervalId = setInterval(() => {
      reload();
    }, 30_000);
    return () => clearInterval(intervalId);
  }, [user, params.id, reload]);

  const onRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH", credentials: 'same-origin' });
      reload();
    } catch (err) {
      console.error("[passenger/notifications] onRead", err);
    }
  }, [reload]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <NotificationsPage items={items} onRead={onRead} />;
}
