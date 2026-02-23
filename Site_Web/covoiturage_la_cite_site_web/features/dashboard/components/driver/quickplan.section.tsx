"use client";

/**
 * @file quickplan.section.tsx
 * @description Section "Planification Rapide" — exclusif au rôle Conducteur.
 *
 * Affiche les destinations récentes du conducteur triées par date décroissante.
 * Permet de republier rapidement un trajet récurrent sans remplir le formulaire
 * complet (raccourci vers création trajet — §3.1 du manifeste).
 *
 * Chaque carte :
 * - Images Unsplash départ / arrivée (clip-path diagonal, chargées en parallèle)
 * - Départ → Arrivée avec points de passage (waypoints)
 * - Date relative + heure
 * - Boutons "Modifier" (pre-fill SuperSearchSection) et "Publier"
 *
 * @uses RecentDestination — type depuis dashboard/types/driver.types
 * @uses FIXTURE_RECENT_DESTINATIONS — données de test (à remplacer par API)
 * @uses formatDate — utilitaire depuis core/utils/date.utils
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { getCityImage } from "@/core/lib/unsplash";
import { formatDate } from "@/core/utils/date.utils";

import { TripWay } from "../../types";
import { FIXTURES_TRIP_WAYS } from "@/tests/fixtures/dashboard/tripways.fixtures";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * QuickPlanSection
 *
 * @param destinations Destinations récentes du conducteur, triées par date desc.
 *   Par défaut : FIXTURES_TRIP_WAYS.
 *   TODO: Brancher sur GET /api/driver/{userId}/recent-destinations?limit=5
 *     Basé sur l'historique des trajets publiés (trajets distincts les plus récents).
 */
export function QuickPlanSection({
  destinations = FIXTURES_TRIP_WAYS,
}: {
  destinations?: TripWay[];
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Tri par date décroissante (destinations les plus récentes d'abord)
  // Utilise toSorted pour ne pas muter la prop
  const sorted = [...destinations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <section className="w-full py-5 flex flex-col items-center border rounded-lg shadow-md mx-5 text-white bg-[#08316ee5]">

      {/* ─── En-tête ────────────────────────────────────────────────── */}
      <div className="flex justify-between items-baseline mx-auto px-5 w-full">
        <h2 className="text-3xl text-white font-bold">
          {isFR ? "Planification Rapide" : "Quick Plan"}
        </h2>
        <Link href="/driver/trips/create" aria-label={isFR ? "Créer un trajet" : "Create a trip"}>
          <FaExternalLinkAlt className="text-2xl text-gray-400 hover:text-white transition-colors" />
        </Link>
      </div>

      <div className="w-full h-1 bg-white rounded-full" />

      {/* ─── Liste ou état vide ───────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="w-full h-50 flex justify-center items-center">
          <p className="text-gray-200 text-center text-2xl m-10">
            {isFR
              ? "Aucune destination récente pour le moment."
              : "No recent destinations at the moment."}
          </p>
        </div>
      ) : (
        <div
          className="w-full h-60 overflow-y-auto flex flex-col gap-4 px-5 py-3"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {sorted.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>
      )}

      <div className="w-full h-1 bg-white rounded-full" />
    </section>
  );
}

// ─── Carte de destination récente ────────────────────────────────────────────

/**
 * DestinationCard
 * Affiche les détails d'une destination récente avec actions Modifier / Publier.
 *
 * - Clic sur la carte → préremplit SuperSearchSection via query params (router.push)
 * - Bouton "Modifier" → route de création trajet avec paramètres pré-remplis
 * - Bouton "Publier" → publie directement avec les valeurs de la dernière fois
 *
 * TODO (Modifier): router.push(`/driver/trips/create?departure=${}&destination=${}...`)
 * TODO (Publier): POST /api/driver/{userId}/trips avec les données de dest
 */
function DestinationCard({ dest }: { dest: TripWay }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const router = useRouter();

  const [departureImg,   setDepartureImg]   = useState("");
  const [destinationImg, setDestinationImg] = useState("");

  // Chargement en parallèle des images Unsplash
  useEffect(() => {
    Promise.all([
      getCityImage(dest.departure),
      getCityImage(dest.destination),
    ]).then(([dep, dest_img]) => {
      setDepartureImg(dep);
      setDestinationImg(dest_img);
    });
  }, [dest.departure, dest.destination]);

  const waypointsLabel = dest.waypoints?.join(", ")
    ?? (isFR ? "Aucun point de passage" : "No waypoints");

  return (
    <div
      className="w-full min-h-30 flex justify-between items-center border-2 border-gray-100
                 rounded-lg shadow-xl bg-white p-4 hover:shadow-2xl hover:shadow-black
                 transition-all cursor-pointer"
      onClick={() =>
        router.push(
          `/driver/trips/create?departure=${encodeURIComponent(dest.departure)}&destination=${encodeURIComponent(dest.destination)}`,
        )
      }
    >
      {/* ─── Images départ / arrivée (clip-path diagonal) ─────────── */}
      <div className="relative w-3/11 m-3 rounded-xl h-full overflow-hidden group min-h-20">
        {departureImg && (
          <Image
            src={departureImg}
            alt={dest.departure}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform
                       duration-500 [clip-path:polygon(0_0,60%_0,40%_100%,0_100%)]"
          />
        )}
        {destinationImg && (
          <Image
            src={destinationImg}
            alt={dest.destination}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform
                       duration-500 [clip-path:polygon(60%_0,100%_0,100%_100%,40%_100%)]"
          />
        )}
      </div>

      {/* ─── Informations itinéraire ─────────────────────────────── */}
      <div className="flex flex-col w-full gap-2">
        {/* Ligne départ → arrivée + waypoints */}
        <div className="flex w-full gap-x-6 items-center justify-start">
          <p className="text-2xl flex font-semibold text-black items-center gap-2">
            <FaLocationDot className="text-[#08316e] shrink-0" />
            <span className="truncate max-w-40">{dest.departure}</span>
            <FaArrowRight className="text-[#08316e] mx-5 scale-x-235 h-5 mt-1.5 shrink-0" />
            <span className="truncate max-w-40">{dest.destination}</span>
          </p>
          <p
            className="text-xl text-[#08316e] font-bold truncate max-w-40"
            title={waypointsLabel}
          >
            {isFR ? "via" : "Via"} : {waypointsLabel}
          </p>
        </div>

        {/* Date relative + heure */}
        <span className="text-xl font-semibold text-black">
          {isFR ? "Pour : " : "For : "}
          {formatDate(dest.date, appState.lang)} : {dest.time}
        </span>
      </div>

      {/* ─── Actions Modifier / Publier ──────────────────────────── */}
      <div
        className="flex flex-col h-full justify-between w-3/11 gap-y-5 items-center"
        onClick={(e) => e.stopPropagation()} // évite le routage au clic des boutons
      >
        <button
          className="w-full bg-white border-gray-400/20 shadow-lg border hover:bg-gray-100
                     hover:shadow text-[#08316e] hover:scale-105 font-bold py-1 text-xl
                     px-4 rounded-xl transition-all duration-200"
          onClick={() => {
            // TODO: router.push(`/driver/trips/create?departure=${...}&destination=${...}&date=${...}&time=${...}&waypoints=${...}`)
          }}
        >
          {isFR ? "Modifier" : "Edit"}
        </button>
        <button
          className="w-full bg-[#08316e] hover:bg-[#061a4b] hover:shadow text-white
                     hover:text-gray-200 font-bold py-1 hover:scale-105 text-xl px-4
                     rounded-xl transition-all duration-200"
          onClick={() => {
            // TODO: POST /api/driver/{userId}/trips avec les données de dest
            // Puis router.push(`/driver/trips/${newTripId}`)
          }}
        >
          {isFR ? "Publier" : "Publish"}
        </button>
      </div>
    </div>
  );
}
