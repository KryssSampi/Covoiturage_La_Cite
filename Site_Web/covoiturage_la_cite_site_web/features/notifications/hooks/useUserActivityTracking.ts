"use client";

/**
 * useUserActivityTracking — Synchronise l'activité web de l'utilisateur.
 *
 * - À l'initialisation : POST /api/user-activity { action: 'connect' }
 * - Sur beforeunload (fermeture tab/navigateur) : POST /api/user-activity { action: 'disconnect' }
 * - Sur logout explicite : expose disconnectUser() pour être appelé avant la déconnexion
 *
 * N'effectue aucun appel si userId est absent (utilisateur non connecté).
 */

import { useEffect, useCallback, useRef } from "react";

export function useUserActivityTracking(
  userId: string | undefined,
  accountCreatedAt?: string,
  role?: string,
) {
  const connectedRef = useRef(false);

  const connect = useCallback(async () => {
    if (!userId || connectedRef.current) return;
    connectedRef.current = true;
    try {
      await fetch("/api/user-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "connect",
          accountCreatedAt: accountCreatedAt ?? new Date().toISOString(),
          userAgent: navigator.userAgent,
          role,
        }),
      });
    } catch {
      // Silencieux — non critique
    }
  }, [userId, accountCreatedAt, role]);

  const disconnect = useCallback(async () => {
    if (!userId || !connectedRef.current) return;
    connectedRef.current = false;
    try {
      // keepalive : garantit l'envoi même si la page se ferme
      await fetch("/api/user-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "disconnect" }),
        keepalive: true,
      });
    } catch {
      // Silencieux — non critique
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    connect();

    const handleUnload = () => {
      // sendBeacon avec Blob application/json pour que le serveur parse correctement
      if (navigator.sendBeacon) {
        const blob = new Blob(
          [JSON.stringify({ userId, action: "disconnect" })],
          { type: "application/json" },
        );
        navigator.sendBeacon("/api/user-activity", blob);
      } else {
        disconnect();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return { disconnectUser: disconnect };
}
