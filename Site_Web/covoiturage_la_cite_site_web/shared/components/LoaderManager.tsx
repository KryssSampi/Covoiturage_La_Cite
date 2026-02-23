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
      // Activation
      setActiveLoader(true);

      // Minimum visible time
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setActiveLoader(false);
      }, 4000);

      previousPath.current = pathname;
    }
  }, [pathname, setActiveLoader]);

  return <GlobalLoader />;
}