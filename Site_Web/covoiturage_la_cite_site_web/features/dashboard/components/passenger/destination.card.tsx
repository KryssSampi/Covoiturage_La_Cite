// features/dashboard/components/passenger/destination-card.tsx
"use client";

import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Language, useAppState } from "@/core/state/app_state";
import { getCityImage } from "@/core/lib/unsplash";
import type { Destination } from "../../types";

interface Props {
  dest: Destination;
}

/**
 * Displays a clickable card summarizing a passenger's saved destination route.
 *
 * Shows departure and destination city images side-by-side with a diagonal clip-path effect,
 * route information (departure → destination), available seats, and favorite driver count.
 * Clicking the card navigates to the search page with the corresponding departure and destination parameters.
 *
 * @param props - The component props.
 * @param props.dest - The destination object containing departure, destination, availability,
 *                     and favorite driver count information.
 *
 * @returns A styled card element with city images, route details, and a link to the search results.
 */
export function DestinationCard({ dest }: Props) {
  const appState = useAppState();
  const router   = useRouter();

  const [departureImg,   setDepartureImg]   = useState("");
  const [destinationImg, setDestinationImg] = useState("");

  useEffect(() => {
    getCityImage(dest.departure).then(setDepartureImg);
    getCityImage(dest.destination).then(setDestinationImg);
  }, [dest.departure, dest.destination]);

  const searchUrl = `/search?departure=${dest.departure}&destination=${dest.destination}`;

  return (
    <div
      className="w-full min-h-30 flex justify-between items-center border-2 border-gray-100 rounded-lg shadow-xl bg-white p-4 hover:shadow-2xl hover:shadow-gray-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      onClick={() => router.push(searchUrl)}
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
          <span className="font-light text-blue-400">{dest.disponibility}</span>{" "}
          {appState.lang === Language.FR ? "places disponibles" : "available seats"}
        </p>

        {dest.favoriteDriverCount > 0 && (
          <p className="text-[#08316e] text-xl font-bold">
            <span className="font-light text-blue-400">{dest.favoriteDriverCount}</span>{" "}
            {appState.lang === Language.FR ? "Conducteur préféré" : "Favorite Driver"}
          </p>
        )}
      </div>

      <Link
        href={searchUrl}
        onClick={(e) => e.stopPropagation()}
        className="text-blue-500 hover:text-blue-700 font-medium text-xl hover:underline"
      >
        {appState.lang === Language.FR ? "Voir" : "See"}
      </Link>
    </div>
  );
}