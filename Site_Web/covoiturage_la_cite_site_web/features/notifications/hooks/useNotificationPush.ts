"use client";

/**
 * useNotificationPush — Queue de notifications temps réel
 *
 * Comportement à la connexion :
 *   1. Fetch de toutes les notifications non lues depuis /api/notifications?isRead=false
 *   2. Si N > 0 : notification-résumé "Vous avez reçu N notifications" affichée en premier
 *      suivie de chaque notification non lue (du plus récent au plus ancien)
 *   3. La queue s'affiche une alerte à la fois — dismissable manuellement
 *
 * Comportement en session :
 *   - SSE /api/sse/notifications pousse les nouvelles notifications
 *   - Chaque nouvelle notif est ajoutée en fin de queue
 *
 * La queue se vide après l'affichage complet — ne repersiste pas entre sessions.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { NotificationModel } from "@/core/models/NotificationModel";

const NOTIF_SOUND_URL = "/assets/sounds/notification.wav";

// ─── Notification de résumé virtuelle (pas stockée en DB) ────────────────────

function buildSummaryNotif(count: number, userId: string, role: string): NotificationModel {
  return {
    id: "__SUMMARY__",
    userId,
    type: "system",
    title: `${count} notification${count > 1 ? "s" : ""} non lue${count > 1 ? "s" : ""}`,
    message: `Vous avez reçu ${count} notification${count > 1 ? "s" : ""} pendant votre absence.`,
    isRead: false,
    isImportant: false,
    link: `/${role}/notifications/${userId}`,
    linkLabel: "Voir toutes les notifications",
    createdAt: new Date().toISOString(),
  };
}

// ─── Interface publique ───────────────────────────────────────────────────────

export interface NotificationPushState {
  /** Nombre total de notifications non lues en DB */
  unreadCount: number;
  /** Notification actuellement affichée dans l'alerte (null si queue vide) */
  current: NotificationModel | null;
  /** true si une alerte doit s'afficher */
  hasAlert: boolean;
  /** Nombre d'éléments restants dans la queue (incluant current) */
  queueLength: number;
  /** Passe à la notification suivante (ou ferme si dernière) */
  dismissCurrent: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotificationPush(
  userId: string | undefined,
  userRole?: string,
): NotificationPushState {
  const [unreadCount, setUnreadCount] = useState(0);
  const [queue, setQueue] = useState<NotificationModel[]>([]);
  const [current, setCurrent] = useState<NotificationModel | null>(null);
  const [hasAlert, setHasAlert] = useState(false);

  const lastSeenIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = new Audio(NOTIF_SOUND_URL);
    audioRef.current.volume = 0.6;
  }, []);

  const playSound = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  // ── Son à chaque changement de notification courante ──────────────────────
  useEffect(() => {
    if (!current) return;
    playSound();
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dismiss : passe à la notification suivante ────────────────────────────
  const dismissCurrent = useCallback(() => {
    setQueue((prev) => {
      const [, ...rest] = prev;
      if (rest.length > 0) {
        setCurrent(rest[0]);
        setHasAlert(true);
      } else {
        setCurrent(null);
        setHasAlert(false);
      }
      return rest;
    });
  }, []);

  // ── Fetch initial : non-lues → queue de reconnexion ───────────────────────
  useEffect(() => {
    if (!userId || !userRole) return;

    async function loadUnread() {
      try {
        const res = await fetch(
          `/api/notifications?userId=${encodeURIComponent(userId!)}&isRead=false`,
        );
        if (!res.ok) return;
        const unread: NotificationModel[] = await res.json();

        setUnreadCount(unread.length);
        if (unread.length === 0) return;

        const sorted = [...unread].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        lastSeenIdRef.current = sorted[0].id;

        const summary = buildSummaryNotif(sorted.length, userId!, userRole!);
        const fullQueue = [summary, ...sorted];

        setQueue(fullQueue);
        setCurrent(fullQueue[0]);
        setHasAlert(true);
      } catch {
        // Silencieux
      }
    }

    loadUnread();
  }, [userId, userRole, playSound]);

  // ── SSE : nouvelles notifications en cours de session ─────────────────────
  useEffect(() => {
    if (!userId) return;

    const source = new EventSource(
      `/api/sse/notifications?userId=${encodeURIComponent(userId)}`,
    );

    source.addEventListener("notification", (e: MessageEvent) => {
      const data = JSON.parse(e.data) as {
        unreadCount: number;
        latest: NotificationModel | null;
      };

      setUnreadCount(data.unreadCount);

      if (data.latest && data.latest.id !== lastSeenIdRef.current) {
        lastSeenIdRef.current = data.latest.id;

        setQueue((prev) => {
          const updated = [...prev, data.latest!];
          if (prev.length === 0) {
            setCurrent(data.latest!);
            setHasAlert(true);
          }
          return updated;
        });
      }
    });

    source.onerror = () => {};
    return () => source.close();
  }, [userId, playSound]);

  return { unreadCount, current, hasAlert, queueLength: queue.length, dismissCurrent };
}
