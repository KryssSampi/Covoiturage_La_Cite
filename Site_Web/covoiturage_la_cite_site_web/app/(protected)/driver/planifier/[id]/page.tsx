"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Hero }                    from "@/features/planner/components/shared/hero";
import { RideArea }                from "@/features/planner/components/shared/rides.area";
import SuperCalendar               from "@/features/planner/components/shared/calendar";
import { PlannerFeatureProvider }  from "@/features/planner/context/PlannerFeatureProvider";
import { useHeroSearchBar }        from "@/features/planner/context/SearchBarContext";
import dynamic                     from "next/dynamic";
import { FaCalendarDays }          from "react-icons/fa6";

// RouteMapSearch chargé en client-only (Leaflet ne fonctionne pas en SSR)
const RouteMapSearch = dynamic(
  () => import("@/features/search/components/shared/RouteMapSearch").then((m) => m.RouteMapSearch),
  { ssr: false },
);

/** Variantes d'animation partagées entre les deux vues */
const calendarVariants = {
  initial:  { opacity: 0, y: -48, scale: 0.97 },
  animate:  { opacity: 1, y:   0, scale: 1    },
  exit:     { opacity: 0, y:  56, scale: 0.97 },
};

const mapVariants = {
  initial:  { opacity: 0, y:  56, scale: 0.97 },
  animate:  { opacity: 1, y:   0, scale: 1    },
  exit:     { opacity: 0, y: -48, scale: 0.97 },
};

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// ─── Contenu intérieur — doit être dans le Provider pour accéder au contexte ───

function PlannerContent() {
  const { plannerSearchActive, plannerSearchValues, pendingDateTime, exitPlannerSearch } = useHeroSearchBar();

  return (
    <div className="flex flex-col mb-10 h-full bg-white">
      <Hero />

      {/* Bouton "Retour au calendrier" : glisse depuis la gauche lors de l'entrée en mode search */}
      <AnimatePresence>
        {plannerSearchActive && (
          <motion.div
            key="back-btn"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x:   0 }}
            exit={{    opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex items-center gap-3 px-4 pt-4"
          >
            <button
              onClick={exitPlannerSearch}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#08316e] hover:bg-[#0a4a9e] text-white rounded-lg shadow transition-colors duration-200"
            >
              <FaCalendarDays size={14} />
              {"Retour au calendrier"}
            </button>
            <span className="text-sm text-gray-500">
              {plannerSearchValues?.departureLabel && plannerSearchValues?.arrivalLabel
                ? `Resultats : ${plannerSearchValues.departureLabel} vers ${plannerSearchValues.arrivalLabel}`
                : "Remplissez le formulaire ci-dessus pour rechercher un circuit"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transition animée : calendrier ↔ RouteMapSearch ── */}
      <AnimatePresence mode="wait">
        {plannerSearchActive ? (
          <motion.div
            key="route-map"
            variants={mapVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="px-4 pt-2 pb-6"
          >
            {/* Le pendingDateTime est transmis pour être sauvegardé lors du choix de circuit */}
            <RouteMapSearch
              role="driver"
              initialValues={plannerSearchValues ?? undefined}
              pendingDateTime={pendingDateTime}
            />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            variants={calendarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <SuperCalendar />
          </motion.div>
        )}
      </AnimatePresence>

      <RideArea />
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function PlannerPage() {
  return (
    // PlannerFeatureProvider regroupe PlannerProvider, IndisponibilityProvider et SearchBarProvider
    <PlannerFeatureProvider>
      <PlannerContent />
    </PlannerFeatureProvider>
  );
}

