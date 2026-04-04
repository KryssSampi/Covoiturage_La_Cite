// features/auth/components/BlockedStep.tsx
// Composant pour l'étape "session bloquée" dans le flux d'authentification.
import React, { useState, useEffect } from 'react';

export default function BlockedStep({ blocked, isFr }: { blocked: { blockedUntil: number; remainingSeconds: number } | null; isFr: boolean }) {
  const [remaining, setRemaining] = useState(blocked?.remainingSeconds ?? 0);

  useEffect(() => {
    if (!blocked) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, Math.floor(blocked.blockedUntil) - now);
      setRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blocked]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const timeStr = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].filter(Boolean).join(':');

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFr ? 'Session bloquée' : 'Session blocked'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFr
            ? 'Trop de tentatives. Veuillez réessayer dans :'
            : 'Too many attempts. Please try again in:'}
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 px-6 py-3">
        <span className="text-3xl font-mono font-semibold text-gray-900 tabular-nums">
          {timeStr}
        </span>
      </div>
    </div>
  );
}
