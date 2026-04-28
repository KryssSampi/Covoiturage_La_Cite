"use client";

/**
 * @file nouveautes.section.tsx
 * @description Section "Nouveautés" du dashboard — commune à tous les rôles.
 *
 * Carrousel de vidéos YouTube présentant les nouvelles fonctionnalités
 * de la plateforme. Navigation manuelle (chevrons) + auto-avancement
 * toutes les 3 minutes (configurable via AUTO_SLIDE_INTERVAL_MS).
 *
 * Chaque slide embarque un iframe YouTube en autoplay mute=0,
 * ce qui peut démarrer avec le son si l'utilisateur a interagi avec la page.
 *
 * @uses useNouveautesSlider — gestion de l'index courant et des transitions
 * @uses NouveauteVideo — type depuis fixtures/nouveautes.fixtures
 * @uses NOUVEAUTE_VIDEOS — données éditoriales statiques
 *
 * @remarks
 * Le tableau videos est défini en dehors du composant (module scope)
 * pour éviter une recréation à chaque render et stabiliser les deps du useEffect.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { TargetAndTransition } from "framer-motion";
import { Language, useAppState } from "@/core/state/app_state";
import {useNouveautesSlider} from "../../hooks/useNouveautesSlider";

import { NouveauteVideo, NOUVEAUTE_VIDEOS } from "@/tests/fixtures/dashboard/nouveautes.fixtures";

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/** Durée en ms entre chaque avancement automatique (3 minutes) */
const AUTO_SLIDE_INTERVAL_MS = 180_000;

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * NouveautesSection
 *
 * @param videos Liste des vidéos YouTube à afficher.
 *   Par défaut : NOUVEAUTE_VIDEOS (données éditoriales statiques).
 *   TODO (optionnel): Brancher sur GET /api/admin/nouveautes
 *     si les vidéos doivent être modifiables sans redéploiement.
 */
export function NouveautesSection() {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const [videos, setVideos] = useState<NouveauteVideo[]>(NOUVEAUTE_VIDEOS);
  const { currentIndex, transitions, next, prev } = useNouveautesSlider();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/nouveautes");
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;
        // Mapper le format API vers NouveauteVideo[] (YouTube uniquement)
        const mapped = data
          .map((item: any) => {
            const youtubeId = getYoutubeId(item.videoUrl);
            if (!youtubeId) return null;
            return {
              youtubeId,
              title: item.title || "Nouveauté",
            };
          })
          .filter(Boolean);
        if (!cancelled && mapped.length > 0) setVideos(mapped);
      } catch (e) {
        // fallback sur fixtures
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const interval = setInterval(next, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [next]);

  if (!videos.length) return null;

  return (
    <section className="w-full h-100 scale-110 relative">
      {/* Image de fond de la section */}
      <Image
        src="/img/nouveautes-section-background.png"
        alt="Nouveautés background"
        width={1000}
        height={100}
        className="absolute inset-0 lg:w-full h-full"
      />

      <div className="container flex justify-between items-center mx-auto px-1 relative">
        {/* ─── Bouton Précédent ─────────────────────────────────────── */}
        <div
          className="flex bg-gray-100/40 min-h-80 justify-center items-center
                     lg:ml-10 mt-10 hover:bg-gray-200 transition-all duration-300 hover:scale-105"
        >
          <FaChevronLeft
            className="text-gray-400 text-6xl cursor-pointer"
            onClick={prev}
            aria-label={isFR ? "Vidéo précédente" : "Previous video"}
          />
        </div>

        {/* ─── Slide courant ────────────────────────────────────────── */}
        <div className="flex flex-col overflow-hidden relative">
          <h2 className="lg:text-5xl text-2xl w-full text-center mt-5 font-bold font-serif text-white">
            {isFR ? "Nouveauté(s)" : "New(s)"}
          </h2>

          <div className="bg-black rounded-lg px-3">
            <motion.div
              key={currentIndex}
              className="bg-white lg:w-200 h-80"
              initial={transitions[currentIndex]?.initial as TargetAndTransition | undefined}
              animate={transitions[currentIndex]?.animate as TargetAndTransition | undefined}
              exit={transitions[currentIndex]?.exit as TargetAndTransition | undefined}
              transition={{ duration: 1 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videos[currentIndex % videos.length].youtubeId}?autoplay=1&mute=0&controls=1`}
                title={videos[currentIndex % videos.length].title}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </div>
        </div>

        {/* ─── Bouton Suivant ───────────────────────────────────────── */}
        <div
          className="flex bg-gray-100/40 min-h-80 justify-center items-center
                     lg:mr-10 mt-10 hover:bg-gray-200 transition-all duration-300 hover:scale-105"
        >
          <FaChevronRight
            className="text-gray-400 text-6xl cursor-pointer"
            onClick={next}
            aria-label={isFR ? "Vidéo suivante" : "Next video"}
          />
        </div>
      </div>
    </section>
  );
}
