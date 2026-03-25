/**
 * Hook d'animation au scroll via IntersectionObserver.
 * Déclenche un état visible lorsqu'un élément entre dans le viewport.
 */

import { useCallback, useEffect, useRef, useState } from "react";

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
 * Retourne un `containerRef` à attacher sur le div `.zoom-wrap` du graphique :
 *   - Ctrl+Scroll (ou ⌘+Scroll sur Mac) pour zoomer à la molette
 *   - Pinch-to-zoom sur mobile
 *   - Double-clic pour reset
 */
export function useZoom(initial = 1, min = 1, max = 3, step = 0.3) {
  const [scale, setScale] = useState(initial);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn  = useCallback(() => setScale((s) => Math.min(max, +(s + step).toFixed(2))), [max, step]);
  const zoomOut = useCallback(() => setScale((s) => Math.max(min, +(s - step).toFixed(2))), [min, step]);
  const reset   = useCallback(() => setScale(initial), [initial]);

  // ── Molette (Ctrl / ⌘ + scroll) ───────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.deltaY < 0 ? zoomIn() : zoomOut();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomIn, zoomOut]);

  // ── Pinch-to-zoom (touch) ─────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (Math.abs(dist - lastDist) > 10) {
        dist > lastDist ? zoomIn() : zoomOut();
        lastDist = dist;
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
    };
  }, [zoomIn, zoomOut]);

  // ── Double-clic pour reset ────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("dblclick", reset);
    return () => el.removeEventListener("dblclick", reset);
  }, [reset]);

  return { scale, zoomIn, zoomOut, reset, containerRef };
}
