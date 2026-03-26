// features/dashboard/components/passenger/destination-card.tsx
"use client";

import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Language, useAppState } from "@/core/state/app_state";
import { getCityImage } from "@/core/lib/unsplash";
import type { Destination } from "../../types";
import type { SurveyDestination } from "../../types/survey-destination.types";

interface Props {
  dest: Destination;
  /** Données de survey associées (matching trips pré-calculés) — optionnel */
  survey?: SurveyDestination;
}

/**
 * Carte cliquable résumant une destination sauvegardée du passager.
 *
 * Affiche les images des villes de départ et destination côte à côte,
 * les informations de trajet, places disponibles et conducteurs favoris.
 * Un clic navigue vers la page de recherche avec les coordonnées pré-remplies.
 * Si un SurveyDestination est fourni, les matching trips sont stockés en
 * sessionStorage pour pré-peupler la recherche sans lancer une nouvelle requête.
 */
export function DestinationCard({ dest, survey }: Props) {
  const appState = useAppState();
  const router   = useRouter();

  const [departureImg,   setDepartureImg]   = useState("");
  const [destinationImg, setDestinationImg] = useState("");

  useEffect(() => {
    getCityImage(dest.departure).then(setDepartureImg);
    getCityImage(dest.destination).then(setDestinationImg);
  }, [dest.departure, dest.destination]);

  // Construit l'URL de recherche avec les coordonnées si disponibles
  const buildSearchUrl = useCallback(() => {
    const userId = appState.userConnected?.id ?? "me";
    const coords = survey
      ? { depLng: survey.departureCoords[0], depLat: survey.departureCoords[1], arrLng: survey.arrivalCoords[0], arrLat: survey.arrivalCoords[1] }
      : dest.departureCoords && dest.arrivalCoords
        ? { depLng: dest.departureCoords[0], depLat: dest.departureCoords[1], arrLng: dest.arrivalCoords[0], arrLat: dest.arrivalCoords[1] }
        : null;

    let url = `/passenger/search/${userId}?dep=${encodeURIComponent(dest.departure)}&arr=${encodeURIComponent(dest.destination)}`;
    if (coords) {
      url += `&depLng=${coords.depLng}&depLat=${coords.depLat}&arrLng=${coords.arrLng}&arrLat=${coords.arrLat}`;
    }
    return url;
  }, [appState.userConnected?.id, dest, survey]);

  // Navigation avec stockage des tripIds en sessionStorage pour pré-peupler la recherche
  const handleNavigate = useCallback(() => {
    if (survey?.tripIds?.length) {
      sessionStorage.setItem("surveyTripIds", JSON.stringify(survey.tripIds));
    } else {
      sessionStorage.removeItem("surveyTripIds");
    }
    router.push(buildSearchUrl());
  }, [survey, router, buildSearchUrl]);

  return (
    <div
      className="w-full min-h-30 flex justify-between items-center border-2 border-gray-100 rounded-lg shadow-xl bg-white p-4 hover:shadow-2xl hover:shadow-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Images ville départ / destination */}
      <div className="relative w-full mx-3 rounded-xl h-full overflow-hidden">
        {departureImg && (
          <Image
            src={departureImg}
            alt={`${dest.departure}`}
            fill
            className="absolute inset-0 object-cover [clip-path:polygon(0_0,60%_0,40%_100%,0_100%)]"
          />
        )}
        {destinationImg && (
          <Image
            src={destinationImg}
            alt={`${dest.destination}`}
            fill
            className="absolute inset-0 object-cover [clip-path:polygon(60%_0,100%_0,100%_100%,40%_100%)]"
          />
        )}
      </div>

      {/* Infos trajet */}
      <div className="flex flex-col max-w-7/11 gap-2">
        <p className="text-2xl flex font-semibold text-black items-center gap-2">
          <FaLocationDot className="text-[#08316e]" />
          <span className="truncate max-w-40">{dest.departure}</span>
          <FaArrowRight className="text-[#08316e] mx-5 scale-x-235 h-5 mt-1.5" />
          <span className="truncate max-w-40">{dest.destination}</span>
        </p>

        <p className="text-xl text-[#08316e] font-bold">
          <span className="font-light text-blue-400">{survey?.tripIds?.length ?? dest.disponibility}</span>{" "}
          {appState.lang === Language.FR ? "places disponibles" : "available seats"}
        </p>

        {(survey?.favoriteDriverIds?.length ?? dest.favoriteDriverCount) > 0 && (
          <p className="text-[#08316e] text-xl font-bold">
            <span className="font-light text-blue-400">{survey?.favoriteDriverIds?.length ?? dest.favoriteDriverCount}</span>{" "}
            {appState.lang === Language.FR ? "Conducteur préféré" : "Favorite Driver"}
          </p>
        )}
      </div>

      <Link
        href={buildSearchUrl()}
        onClick={(e) => {
          e.stopPropagation();
          if (survey?.tripIds?.length) {
            sessionStorage.setItem("surveyTripIds", JSON.stringify(survey.tripIds));
          }
        }}
        className="text-blue-500 hover:text-blue-700 font-medium text-xl hover:underline"
      >
        {appState.lang === Language.FR ? "Voir" : "See"}
      </Link>
    </div>
  );
}