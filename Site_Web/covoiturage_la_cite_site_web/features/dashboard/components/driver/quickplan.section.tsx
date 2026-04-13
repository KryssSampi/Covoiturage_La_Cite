"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { getCityImage } from "@/core/lib/unsplash";
import { formatDate, utcToLocalDateIso, utcToLocalTime } from "@/core/utils/date.utils";
import type { DraftTrip } from "@/features/brouillons/types";

const DEFAULT_CITY_IMAGE = "/assets/destinations-pictures/default-city.png";

function DraftsSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4 px-5 py-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="w-full h-30 rounded-lg bg-white/20 animate-pulse"
        />
      ))}
    </div>
  );
}

export function QuickPlanSection({
  drafts = [],
  isLoading = false,
  error = null,
}: {
  drafts?: DraftTrip[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const safeDrafts = drafts ?? [];

  return (
    <section className="w-full py-5 flex flex-col items-center border rounded-lg shadow-md mx-5 text-white bg-[#08316ee5]">
      <div className="flex justify-between items-baseline mx-auto px-5 w-full">
        <h2 className="text-3xl text-white font-bold">
          {isFR ? "Planification Rapide" : "Quick Plan"}
        </h2>
        <Link
          href={`/driver/create-trip/${appState.userConnected?.id}`}
          aria-label={isFR ? "Creer un trajet" : "Create a trip"}
        >
          <FaExternalLinkAlt className="text-2xl text-gray-400 hover:text-white transition-colors" />
        </Link>
      </div>

      <div className="w-full h-1 bg-white rounded-full" />

      {isLoading ? (
        <DraftsSkeleton />
      ) : error ? (
        <div className="w-full h-50 flex justify-center items-center">
          <p className="text-red-300 text-center text-lg m-10">{error}</p>
        </div>
      ) : safeDrafts.length === 0 ? (
        <div className="w-full h-50 flex justify-center items-center">
          <p className="text-gray-200 text-center text-2xl m-10">
            {isFR
              ? "Aucun brouillon pour le moment."
              : "No drafts at the moment."}
          </p>
        </div>
      ) : (
        <div
          className="w-full h-60 overflow-y-auto flex flex-col gap-4 px-5 py-3"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {safeDrafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}

      <div className="w-full h-1 bg-white rounded-full" />
    </section>
  );
}

function DraftCard({ draft }: { draft: DraftTrip }) {
  const appState = useAppState();
  const router = useRouter();
  const isFR = appState.lang === Language.FR;
  const userId = appState.userConnected?.id ?? "";

  const [departureImg, setDepartureImg] = useState(DEFAULT_CITY_IMAGE);
  const [destinationImg, setDestinationImg] = useState(DEFAULT_CITY_IMAGE);

  useEffect(() => {
    if (!draft.departureLocation && !draft.arrivalLocation) return;
    Promise.all([
      getCityImage(draft.departureLocation),
      getCityImage(draft.arrivalLocation),
    ]).then(([dep, arr]) => {
      setDepartureImg(dep || DEFAULT_CITY_IMAGE);
      setDestinationImg(arr || DEFAULT_CITY_IMAGE);
    });
  }, [draft.arrivalLocation, draft.departureLocation]);

  const handlePublish = useCallback(() => {
    sessionStorage.setItem("quickPlanDraft", JSON.stringify(draft));
    const params = new URLSearchParams({
      lieu_de_depart: draft.departureLocation,
      lieu_darrivee: draft.arrivalLocation,
      departure_date: draft.departureDate,
      departure_time: draft.departureTime,
      publish: "true",
    });
    router.push(`/driver/create-trip/${userId}?${params.toString()}`);
  }, [draft, router, userId]);

  const descriptionLabel = draft.notes
    ? draft.notes.length > 60 ? `${draft.notes.slice(0, 60)}...` : draft.notes
    : isFR ? "Aucune description" : "No description";

  return (
    <div
      className="w-full min-h-30 flex justify-between items-center border-2 border-gray-100
                 rounded-lg shadow-xl bg-white p-4 hover:shadow-2xl hover:shadow-black
                 transition-all"
    >
      <div className="relative w-3/11 m-3 rounded-xl h-full overflow-hidden group min-h-20">
        <Image
          src={departureImg}
          alt={draft.departureLocation}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform
                     duration-500 [clip-path:polygon(0_0,60%_0,40%_100%,0_100%)]"
        />
        <Image
          src={destinationImg}
          alt={draft.arrivalLocation}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform
                     duration-500 [clip-path:polygon(60%_0,100%_0,100%_100%,40%_100%)]"
        />
      </div>

      <div className="flex flex-col w-full gap-2">
        <div className="flex w-full gap-x-6 items-center justify-start">
          <p className="text-2xl flex font-semibold text-black items-center gap-2">
            <FaLocationDot className="text-[#08316e] shrink-0" />
            <span className="truncate max-w-40">{draft.departureLocation}</span>
            <FaArrowRight className="text-[#08316e] mx-5 scale-x-235 h-5 mt-1.5 shrink-0" />
            <span className="truncate max-w-40">{draft.arrivalLocation}</span>
          </p>
        </div>

        <span className="text-xl font-semibold text-black">
          {isFR ? "Pour : " : "For : "}
          {draft.departureDate
            ? (() => {
                const localIso = utcToLocalDateIso(draft.departureDate, draft.departureTime);
                const localTime = utcToLocalTime(draft.departureDate, draft.departureTime);
                return `${formatDate(localIso, appState.lang, localTime)} : ${localTime}`;
              })()
            : isFR ? "Date non definie" : "Date not set"}
        </span>

        <span className="text-lg text-gray-500 truncate max-w-xs" title={draft.notes}>
          {descriptionLabel}
        </span>

        {draft.polyline && draft.polyline.length > 0 && (
          <span className="text-sm text-green-600 font-medium">
            {isFR ? "Itineraire calcule" : "Route calculated"}
          </span>
        )}
      </div>

      <div
        className="flex flex-col h-full justify-center w-3/11 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="w-full bg-[#08316e] hover:bg-[#061a4b] hover:shadow text-white
                     hover:text-gray-200 font-bold py-2 hover:scale-105 text-xl px-4
                     rounded-xl transition-all duration-200"
          onClick={handlePublish}
        >
          {isFR ? "Publier" : "Publish"}
        </button>
      </div>
    </div>
  );
}
