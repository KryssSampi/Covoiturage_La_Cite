"use client";

/**
 * @file lacite_astuces.section.tsx
 * @description Carrousel d'astuces La Cité — commun à tous les rôles du dashboard.
 *
 * Affiche des conseils de bonne pratique en covoiturage sous forme de diaporama.
 * Navigation manuelle (chevrons) + auto-avancement toutes les 15 secondes.
 *
 * @uses Tip — type depuis dashboard/types
 * @uses LACITE_TIPS — données éditoriales statiques (non liées à une API)
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";

import { Tip } from "../../types/lacite_astuces.types";
import { LACITE_TIPS } from "@/tests/fixtures/dashboard/lacite_astuces.fixtures";

/** Durée en ms entre chaque avancement automatique du carrousel */
const AUTO_SLIDE_INTERVAL_MS = 15_000;

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * LaCiteAstucesSection
 *
 * @param tips Liste des astuces à afficher dans le carrousel.
 *   Par défaut : LACITE_TIPS (données éditoriales statiques).
 */
export function LaCiteAstucesSection({ tips = LACITE_TIPS }: { tips?: Tip[] }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const [index, setIndex] = useState(0);

  // useCallback garantit la stabilité de la référence pour le tableau de deps du useEffect
  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % tips.length);
  }, [tips.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + tips.length) % tips.length);
  }, [tips.length]);

  // Auto-avancement : next est stable grâce à useCallback → pas de re-création de l'interval
  useEffect(() => {
    const interval = setInterval(next, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [next]);

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
