"use client";

/**
 * useWebNotifications — Notifications bureau (Notification API)
 *
 * - Demande la permission au premier montage
 * - Expose showBrowserNotification(title, body, link?) pour afficher une notif native
 * - La notification bureau clique → focus onglet + navigation vers le lien
 * - Silencieux si la permission est refusée ou si l'API n'est pas disponible
 */

import { useEffect, useRef, useCallback } from "react";

export function useWebNotifications(userId: string | undefined) {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    permissionRef.current = Notification.permission;

    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => {
        permissionRef.current = p;
      });
    }
  }, []);

  const showBrowserNotification = useCallback(
    (title: string, body: string, link?: string) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (permissionRef.current !== "granted") return;

      const notif = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        // tag regroupe les notifs du même utilisateur (évite l'empilement)
        tag: `covoiturage-${userId ?? "app"}`,
        // @ts-expect-error renotify is valid Web Notifications API but absent from TS lib
        renotify: true,
      });

      if (link) {
        notif.onclick = () => {
          window.focus();
          window.location.href = link;
          notif.close();
        };
      }
    },
    [userId],
  );

  return { showBrowserNotification };
}
