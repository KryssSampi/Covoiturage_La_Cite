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

// Clé sessionStorage : marquée après le premier push de la session de connexion.
// sessionStorage est vidé à la fermeture du tab, donc chaque nouvel onglet/connexion
// repart d'un état propre.
const initKey = (uid: string) => `notif_init_${uid}`;

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
  // Déclenché uniquement à la connexion (pas sur chaque rechargement de page).
  // Un flag sessionStorage garantit que le push ne s'effectue qu'une seule fois
  // par session de connexion. sessionStorage est effacé à la fermeture du tab.
  useEffect(() => {
    if (!userId || !userRole) return;

    // Si l'utilisateur se déconnecte (userId → undefined) le flag est nettoyé
    // au prochain effet via le return ci-dessous — rien à faire ici.

    // Déjà initialisé dans cet onglet depuis la connexion → on saute.
    // Le flag est posé de façon synchrone (avant le fetch) pour résister
    // au double-mount de React 18 Strict Mode en développement.
    if (sessionStorage.getItem(initKey(userId))) return;
    sessionStorage.setItem(initKey(userId), "1");

    async function loadUnread() {
      try {
        const res = await fetch(
          `/api/notifications?isRead=false`,
          { credentials: 'same-origin' },
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

    // Nettoyage : si userId change (déconnexion → reconnexion d'un autre compte),
    // on retire l'ancien flag pour que le prochain utilisateur reçoive bien ses notifs.
    return () => {
      if (userId) sessionStorage.removeItem(initKey(userId));
    };
  }, [userId, userRole, playSound]);

  // ── Polling : remplacer SSE désactivé par un polling périodique
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let backoff = 10_000; // ms

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/notifications?isRead=false`, { credentials: 'same-origin' });
        if (res.status === 401 || res.status === 403) {
          console.warn('[useNotificationPush] Session expirée, redirection vers /login');
          window.location.href = '/login';
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const unread: NotificationModel[] = await res.json();
        setUnreadCount(unread.length);

        if (unread.length > 0) {
          const sorted = [...unread].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          // Si nouvelle notification depuis la dernière vue, l'ajouter à la queue
          if (sorted[0].id !== lastSeenIdRef.current) {
            lastSeenIdRef.current = sorted[0].id;

            setQueue((prev) => {
              // Ajouter seulement les éléments non présents
              const newItems = sorted.filter((s) => !prev.find((p) => p.id === s.id));
              const updated = [...prev, ...newItems];
              if (prev.length === 0 && updated.length > 0) {
                setCurrent(updated[0]);
                setHasAlert(true);
              }
              return updated;
            });
          }
        }

        // reset backoff on success
        backoff = 10_000;
      } catch (err) {
        if (cancelled) return;
        console.error('[useNotificationPush] polling error:', err);
        // Exponential backoff with cap
        const wait = Math.min(backoff, 300_000);
        backoff = Math.min(backoff * 2, 300_000);
        if (intervalId) clearInterval(intervalId);
        // schedule resume after wait
        setTimeout(() => {
          if (cancelled) return;
          intervalId = setInterval(poll, 15_000);
        }, wait);
      }
    }

    // démarrer immédiatement puis toutes les 15s
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    intervalId = setInterval(poll, 15_000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [userId, playSound]);

  return { unreadCount, current, hasAlert, queueLength: queue.length, dismissCurrent };
}
