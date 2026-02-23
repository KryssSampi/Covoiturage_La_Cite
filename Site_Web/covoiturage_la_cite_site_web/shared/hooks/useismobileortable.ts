// shared/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useIsMobileOrTablet() {
  const [isBelowLg, setIsBelowLg] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 1023px)').matches;
    }
    return false;
  });

  useEffect(() => {
    // 1024px est le breakpoint 'lg' par défaut de Tailwind
    const mediaQuery = window.matchMedia('(max-width: 1023px)');

    // Écouteur de changement
    const handler = (event: MediaQueryListEvent) => setIsBelowLg(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isBelowLg;
}