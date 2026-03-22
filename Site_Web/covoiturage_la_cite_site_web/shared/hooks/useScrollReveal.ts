/**
 * Hook d'animation au scroll via IntersectionObserver.
 * Déclenche un état visible lorsqu'un élément entre dans le viewport.
 */

import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = "0px 0px -40px 0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

/**
 * Hook de contrôle de zoom pour les graphes zoomables.
 */
export function useZoom(initial = 1, min = 1, max = 3, step = 0.3) {
  const [scale, setScale] = useState(initial);
  const zoomIn = () => setScale((s) => Math.min(max, +(s + step).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(min, +(s - step).toFixed(2)));
  const reset = () => setScale(initial);
  return { scale, zoomIn, zoomOut, reset };
}
