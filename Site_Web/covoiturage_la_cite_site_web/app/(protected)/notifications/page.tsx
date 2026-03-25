"use client";

/**
 * Page partagée des notifications — tous rôles confondus.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à NotificationsPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useAppState } from "@/core/state/app_state";
import { NotificationsPage } from "@/features/notifications";
import { notificationModelToNotification } from "@/features/dashboard/converters/dashboard.converter";
import type { NotificationModel } from "@/core/models/NotificationModel";
import type { Notification } from "@/features/dashboard/types";

export default function NotificationsRoutePage() {
  const { userConnected } = useAppState();
  const [items, setItems] = useState<Notification[]>([]);

  // Chargement des données depuis l'API
  const loadData = useCallback(async () => {
    if (!userConnected) return;
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userConnected.id)}`);
      if (!res.ok) return;
      const notifications: NotificationModel[] = await res.json();
      setItems(notifications.map(notificationModelToNotification));
    } catch (error) {
      console.error("[notifications] loadData", error);
    }
  }, [userConnected]);

  // Chargement initial
  useEffect(() => {
    if (!userConnected) return;
     loadData();
  }, [loadData, userConnected]);

  // SSE : mise à jour temps réel lorsque les notifications changent
  useEffect(() => {
    if (!userConnected) return;
    const es = new EventSource("/api/sse/db-watch/notifications");
    let isFirst = true;
    es.addEventListener("update", () => {
      if (isFirst) { isFirst = false; return; }
      void loadData();
    });
    return () => es.close();
  }, [userConnected, loadData]);

  return <NotificationsPage items={items} />;
}
