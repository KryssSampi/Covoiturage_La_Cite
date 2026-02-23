"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLoader } from "@/core/context/loader.context";

export function NavigationLoader({OnchangeComplete}: {OnchangeComplete?: () => void}) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const { setActiveLoader } = useLoader();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      setActiveLoader(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setActiveLoader(false);
        if (OnchangeComplete) {
          OnchangeComplete();
        }
      }, 600); // minimum 600ms visible

      previousPath.current = pathname;
    }

    return () => {
      if (timeoutRef.current) {
        setActiveLoader(false);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [pathname, setActiveLoader, OnchangeComplete]);

  return null; // Ce composant ne rend rien lui-même, il gère juste le loader global
}