"use client";

import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/core/state/app_state";
import { useRouter } from "next/navigation";

// ── Constantes ────────────────────────────────────────────────────────────────
const INACTIVITY_LIMIT_MS  = 30 * 60 * 1000;   // 30 min sans interaction → décompte
const COUNTDOWN_MS         = 120 * 1000;         // 120s de décompte avant logout
const TOKEN_CHECK_INTERVAL = 5  * 60 * 1000;    // vérification token toutes les 5 min
const REFRESH_THRESHOLD_MS = 30 * 60 * 1000;    // refresh si <30 min restants sur le token 6h

// ── Helpers ───────────────────────────────────────────────────────────────────
function now() { return Date.now(); }

// ── Composant ─────────────────────────────────────────────────────────────────
export function SessionManager() {
  const appState = useAppState();
  const router   = useRouter();

  const activityRef      = useRef<number>(now());
  const inactivityTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenCheckTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef  = useRef(false);

  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);

  // ── Logout complet : kill côté client + server ───────────────────────────
  const doLogout = async () => {
    clearAllTimers();
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* best-effort */ }
    appState.logout();
    try { router.replace('/'); } catch { /* ignore */ }
  };

  // ── Refresh silencieux via BFF ────────────────────────────────────────────
  const attemptRefresh = async (): Promise<boolean> => {
    if (isRefreshingRef.current) return true; // déjà en cours
    isRefreshingRef.current = true;
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // ── Vérification expiration du token ─────────────────────────────────────
  const checkTokenAndMaybeRefresh = async () => {
    try {
      const res = await fetch('/api/auth/token-info');
      if (!res.ok) {
        // token invalide ou expiré → refresh ou logout
        const ok = await attemptRefresh();
        if (!ok) await doLogout();
        return;
      }
      const { exp } = await res.json() as { exp: number | null };
      if (!exp) return;

      const remaining = exp * 1000 - now();
      if (remaining <= 0) {
        // expiré
        const ok = await attemptRefresh();
        if (!ok) await doLogout();
        return;
      }
      if (remaining <= REFRESH_THRESHOLD_MS) {
        // <30 min restants → refresh préventif
        await attemptRefresh();
      }
    } catch { /* ignore réseau */ }
  };

  // ── Gestion de l'inactivité ───────────────────────────────────────────────
  const clearInactivityTimers = () => {
    if (inactivityTimer.current)  { clearTimeout(inactivityTimer.current);   inactivityTimer.current = null; }
    if (countdownTimer.current)   { clearInterval(countdownTimer.current);   countdownTimer.current  = null; }
    setCountdownRemaining(null);
  };

  const clearAllTimers = () => {
    clearInactivityTimers();
    if (tokenCheckTimer.current) { clearInterval(tokenCheckTimer.current); tokenCheckTimer.current = null; }
  };

  const startInactivityWatch = () => {
    clearInactivityTimers();
    inactivityTimer.current = setTimeout(() => {
      // 30 min d'inactivité → décompte 120s
      const end = now() + COUNTDOWN_MS;
      setCountdownRemaining(COUNTDOWN_MS);
      countdownTimer.current = setInterval(() => {
        const rem = Math.max(0, end - now());
        setCountdownRemaining(rem);
        if (rem <= 0) {
          if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
          void doLogout();
        }
      }, 1000);
    }, INACTIVITY_LIMIT_MS);
  };

  const onActivity = () => {
    activityRef.current = now();
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('lastActivity', String(activityRef.current)); } catch { /* ignore */ }
    }
    // Annule le décompte si l'utilisateur reprend
    clearInactivityTimers();
    startInactivityWatch();
  };

  // ── Initialisation ────────────────────────────────────────────────────────
  useEffect(() => {
    // Restaurer lastActivity depuis localStorage
    try {
      const stored = localStorage.getItem('lastActivity');
      if (stored) activityRef.current = Number(stored);
    } catch { /* ignore */ }

    const events: string[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click', 'scroll'];
    for (const ev of events) window.addEventListener(ev, onActivity, { passive: true });

    // Démarrer surveillance inactivité
    onActivity();

    // Vérification périodique du token (toutes les 5 min)
    tokenCheckTimer.current = setInterval(() => void checkTokenAndMaybeRefresh(), TOKEN_CHECK_INTERVAL);

    // Intercepteur fetch global : retry automatique sur 401
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await originalFetch(input, init);
      if (res.status !== 401) return res;

      // Éviter de boucler sur les routes d'auth elles-mêmes
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.includes('/api/auth/refresh') || url.includes('/api/auth/logout')) return res;

      const refreshed = await attemptRefresh();
      if (!refreshed) {
        void doLogout();
        return res;
      }
      // Retry la requête originale une seule fois
      return originalFetch(input, init);
    };

    return () => {
      for (const ev of events) window.removeEventListener(ev, onActivity);
      clearAllTimers();
      window.fetch = originalFetch;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rendu : overlay countdown ─────────────────────────────────────────────
  const secondsLeft = countdownRemaining !== null ? Math.ceil(countdownRemaining / 1000) : null;

  if (secondsLeft === null) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => onActivity()}
    >
      <div
        className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl p-6 shadow-xl w-[90%] max-w-md text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-2">Session inactive</h3>
        <p className="mb-4">
          Aucune activité détectée depuis 30 minutes. Cliquez n&apos;importe où pour rester connecté.
        </p>
        <p className="text-3xl font-mono mb-4">{secondsLeft}s</p>
        <div className="flex justify-center gap-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => onActivity()}
          >
            Je suis là
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            onClick={(e) => { e.stopPropagation(); void doLogout(); }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
