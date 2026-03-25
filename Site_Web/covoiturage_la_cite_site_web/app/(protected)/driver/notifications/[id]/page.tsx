"use client";

/**
 * Page des notifications — rôle Conducteur.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à NotificationsPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { NotificationsPage } from "@/features/notifications";
import { notificationModelToNotification } from "@/features/dashboard/converters/dashboard.converter";
import type { NotificationModel } from "@/core/models/NotificationModel";
import type { Notification } from "@/features/dashboard/types";

export default function DriverNotificationsRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;
  const [items, setItems]   = useState<Notification[]>([]);

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

  // Chargement des notifications depuis l'API
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      const notifications: NotificationModel[] = await res.json();
      setItems(notifications.map(notificationModelToNotification));
    } catch (error) {
      console.error("[driver/notifications] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les notifications changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const es = new EventSource("/api/sse/db-watch/notifications");
    let isFirst = true;
    es.addEventListener("update", () => {
      if (isFirst) { isFirst = false; return; }
      void loadData();
    });
    return () => es.close();
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;

  return <NotificationsPage items={items} />;
}
