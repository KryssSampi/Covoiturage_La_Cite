"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { Tip } from "../../types/lacite_astuces.types";

async function fetchTips(): Promise<Tip[]> {
  try {
    const response = await fetch("/api/astuces");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: Tip[] = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[LaCiteAstuces] Impossible de charger les astuces.", err);
    return [];
  }
}

const AUTO_SLIDE_INTERVAL_MS = 15_000;

function AstucesSkeleton() {
  return (
    <section className="w-full border rounded-lg shadow-md bg-[#f8f8f8] py-10 animate-pulse">
      <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
        <div className="h-8 w-48 bg-gray-300 rounded mb-8" />
        <div className="w-full px-5">
          <div className="bg-white rounded-3xl shadow-xl w-full flex flex-col items-center p-6 gap-4">
            <div className="w-full h-60 bg-gray-200 rounded-3xl" />
            <div className="w-full h-px bg-gray-200 my-4" />
            <div className="h-6 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LaCiteAstucesSection({
  tips: propTips,
  isLoading: propIsLoading = false,
}: {
  tips?: Tip[];
  isLoading?: boolean;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const [index, setIndex] = useState(0);
  const [fetchedTips, setFetchedTips] = useState<Tip[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch les astuces au montage du composant
  useEffect(() => {
    let cancelled = false;
    fetchTips().then((data) => {
      if (!cancelled) {
        setFetchedTips(data);
        setIsFetching(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const safeTips = (propTips && propTips.length > 0) ? propTips : fetchedTips;

  const isLoading = propIsLoading || isFetching;

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % safeTips.length);
  }, [safeTips.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + safeTips.length) % safeTips.length);
  }, [safeTips.length]);

  useEffect(() => {
    if (safeTips.length === 0) return;
    const interval = setInterval(next, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [next, safeTips.length]);

  useEffect(() => {
    if (index >= safeTips.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(0);
    }
  }, [index, safeTips.length]);

  if (isLoading) return <AstucesSkeleton />;
  if (safeTips.length === 0) return null;

  return (
    <section className="w-full border rounded-lg shadow-md bg-[#f8f8f8] py-10">
      <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-black mb-8">
          {isFR ? "Astuces " : "Tips "}
          <span className="text-blue-300">La Cite</span>
        </h2>

        <div className="relative w-full flex items-center">
          <button
            onClick={prev}
            aria-label={isFR ? "Astuce precedente" : "Previous tip"}
            className="absolute left-0 z-10 flex items-center justify-center
                       w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white shadow-md
                       hover:bg-gray-100 transition"
          >
            <FaChevronLeft className="text-gray-500 text-2xl lg:text-3xl" />
          </button>

          <div className="overflow-hidden w-full px-5">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {safeTips.map((tip) => (
                <div key={tip.id} className="w-full shrink-0 px-4">
                  <div className="bg-white rounded-3xl shadow-xl w-full h-full flex flex-col items-center p-6 gap-4">
                    <Image
                      src={tip.src}
                      alt={tip.titleen}
                      width={600}
                      height={300}
                      className="rounded-3xl object-cover w-full h-60"
                    />
                    <div className="w-full h-px bg-black my-4" />
                    <h3 className="text-xl font-semibold text-black mb-2 text-center">
                      {isFR ? tip.titlefr : tip.titleen} :
                    </h3>
                    <p className="text-gray-700 text-center">
                      {isFR ? tip.descriptionfr : tip.descriptionen}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            aria-label={isFR ? "Astuce suivante" : "Next tip"}
            className="absolute right-0 z-10 flex items-center justify-center
                       w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white shadow-md
                       hover:bg-gray-100 transition"
          >
            <FaChevronRight className="text-gray-500 text-2xl lg:text-3xl" />
          </button>
        </div>
      </div>
    </section>
  );
}

