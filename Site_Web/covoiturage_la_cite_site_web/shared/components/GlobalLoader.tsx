// shared/components/GlobalLoader.tsx
"use client";

import { useLoader } from "@/core/context/loader.context";
import { useEffect, useState } from "react";

export function GlobalLoader({ forceActive }: { forceActive?: boolean }) {
  const { isActive } = useLoader();
  const active = forceActive || isActive; // ← Next.js ou contexte
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-neutral-900/90 border border-white/10 shadow-2xl rounded-2xl px-10 py-8 flex flex-col items-center gap-6">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-white text-lg tracking-wide font-medium">
          Loading{dots}
        </p>
      </div>
    </div>
  );
}