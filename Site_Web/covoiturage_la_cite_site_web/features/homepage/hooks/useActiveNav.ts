"use client";

import { usePathname } from 'next/navigation';

/**
 * Hook pour gérer la navigation active dans le Header
 * Synchronisé avec le pathname réel de Next.js (usePathname).
 */
export function useActiveNav() {
  const pathname = usePathname();

  return {
    activePath: pathname,
    // Compatibilité descendante — setActive no-op (le pathname est géré par le routeur)
    setActive: (_path: string) => {},
  };
}
