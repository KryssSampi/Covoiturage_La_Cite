"use client";

/**
 * @file lacite_astuces.section.tsx
 * @description Carrousel d'astuces La Cité — commun à tous les rôles du dashboard.
 *
 * Affiche des conseils de bonne pratique en covoiturage sous forme de diaporama.
 * Navigation manuelle (chevrons) + auto-avancement toutes les 15 secondes.
 * Les données sont récupérées depuis l'API (/api/astuces) au montage.
 *
 * @uses Tip — type depuis dashboard/types
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";

import { Tip } from "../../types/lacite_astuces.types";

/** Durée en ms entre chaque avancement automatique du carrousel */
const AUTO_SLIDE_INTERVAL_MS = 15_000;

// ─── Skeleton de chargement ──────────────────────────────────────────────────

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

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * LaCiteAstucesSection
 *
 * Carrousel autonome : récupère les astuces depuis /api/astuces au montage.
 */
export function LaCiteAstucesSection() {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const [index, setIndex] = useState(0);
  const [tips, setTips] = useState<Tip[] | null>(null);

  // Chargement des astuces depuis l'API
  useEffect(() => {
    fetch("/api/astuces")
      .then((r) => r.json())
      .then((data: Tip[]) => setTips(data))
      .catch(() => setTips([]));
  }, []);

  // useCallback garantit la stabilité de la référence pour le useEffect de l'auto-avancement
  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % (tips?.length || 1));
  }, [tips?.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + (tips?.length || 1)) % (tips?.length || 1));
  }, [tips?.length]);

  // Auto-avancement : next est stable grâce à useCallback
  useEffect(() => {
    if (!tips || tips.length === 0) return;
    const interval = setInterval(next, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [next, tips]);

  // Skeleton pendant le chargement
  if (tips === null) return <AstucesSkeleton />;

  // Aucune astuce disponible
  if (tips.length === 0) return null;

  return (
    <section className="w-full border rounded-lg shadow-md bg-[#f8f8f8] py-10">
      <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-black mb-8">
          {isFR ? "Astuces " : "Tips "}
          <span className="text-blue-300">La Cité</span>
        </h2>

        <div className="relative w-full flex items-center">
          {/* ─── Chevron gauche ──────────────────────────────────────── */}
          <button
            onClick={prev}
            aria-label={isFR ? "Astuce précédente" : "Previous tip"}
            className="absolute left-0 z-10 flex items-center justify-center
                       w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white shadow-md
                       hover:bg-gray-100 transition"
          >
            <FaChevronLeft className="text-gray-500 text-2xl lg:text-3xl" />
          </button>

          {/* ─── Piste du carrousel ──────────────────────────────────── */}
          <div className="overflow-hidden w-full px-5">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {tips.map((tip) => (
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

          {/* ─── Chevron droit ───────────────────────────────────────── */}
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
