"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { GlobalLoader } from "./GlobalLoader";

export function LoaderManager() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const { setActiveLoader } = useLoader();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;

      // Filet de sécurité : désactive le loader si la page destination
      // oublie d'appeler setActiveLoader(false). N'active JAMAIS le loader.
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActiveLoader(false);
      }, 1200);
    }
  }, [pathname, setActiveLoader]);

  return <GlobalLoader />;
}