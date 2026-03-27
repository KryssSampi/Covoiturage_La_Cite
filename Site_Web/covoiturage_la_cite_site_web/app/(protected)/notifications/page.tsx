"use client";

import { useEffect, useCallback, useState } from "react";
import { useAppState } from "@/core/state/app_state";
import { NotificationsPage } from "@/features/notifications";
import type { NotificationModel } from "@/core/models/NotificationModel";

export default function NotificationsRoutePage() {
  const { userConnected } = useAppState();
  const [items, setItems] = useState<NotificationModel[]>([]);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // Chargement initial + rechargement à chaque `version`
  useEffect(() => {
    if (!userConnected) return;
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userConnected!.id)}`);
        if (!res.ok || cancelled) return;
        const data: NotificationModel[] = await res.json();
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error("[notifications] fetchData", err);
      }
    }
    void fetchData();
    return () => { cancelled = true; };
  }, [userConnected, version]);

  // SSE : rechargement sur changement DB
  useEffect(() => {
    if (!userConnected) return;
    const es = new EventSource("/api/sse/db-watch/notifications");
    let isFirst = true;
    es.addEventListener("update", () => {
      if (isFirst) { isFirst = false; return; }
      reload();
    });
    return () => es.close();
  }, [userConnected, reload]);

  const onRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      reload();
    } catch (err) {
      console.error("[notifications] onRead", err);
    }
  }, [reload]);

  return <NotificationsPage items={items} onRead={onRead} />;
}
