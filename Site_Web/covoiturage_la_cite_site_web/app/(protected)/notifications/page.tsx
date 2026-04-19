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
        const res = await fetch("/api/notifications", { credentials: 'same-origin' });
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

  // Polling 30s — SSE db-watch désactivé (Server Core SSE sur /api/sse/notifications)
  useEffect(() => {
    if (!userConnected) return;
    const id = setInterval(reload, 30_000);
    return () => clearInterval(id);
  }, [userConnected, reload]);

  // SSE — nouvelles notifications en temps réel
  useEffect(() => {
    if (!userConnected) return;
    const es = new EventSource('/api/sse/notifications');
    es.addEventListener('notification', (event) => {
      try {
        const notif = JSON.parse(event.data);
        const mapped: NotificationModel = {
          id: String(notif.id ?? ''),
          userId: String(notif.userId ?? ''),
          title: String(notif.title ?? notif.body ?? ''),
          message: String(notif.body ?? notif.message ?? ''),
          createdAt: String(notif.createdAt ?? ''),
          type: (notif.type ?? 'info') as NotificationModel['type'],
          link: String(notif.deepLink ?? notif.link ?? ''),
          isRead: false,
          isImportant: Boolean(notif.isImportant),
        };
        setItems(prev => [mapped, ...(prev ?? [])]);
      } catch { /* ignore parse errors */ }
    });
    return () => es.close();
  }, [userConnected]);

  const onRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH", credentials: 'same-origin' });
      reload();
    } catch (err) {
      console.error("[notifications] onRead", err);
    }
  }, [reload]);

  return <NotificationsPage items={items} onRead={onRead} />;
}
