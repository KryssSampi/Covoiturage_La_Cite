"use client";
import Link from "next/link";
import Image from "next/image";
import { Language, useAppState } from "@/core/state/app_state";


export default function ReserveVersionMapButton({LinkUrl}: {LinkUrl: string}) {
  const appState = useAppState();
  return (
    <Link href={LinkUrl} className="text-sm lg:text-lg rounded-xl hover:underline hover:scale-105 w-full max-w-40 max-h-60 relative flex flex-col justify-center items-center border-2 border-gray-400">
      <Image 
        src="/assets/reservertion_map_button/reservation-map.png"
        alt="reservation map" width={600} height={600}
        className="w-16 h-16 md:w-20 md:h-20 rounded-xl absolute inset-0 object-cover"/>
      <span className="relative text-white text-lg lg:text-2xl font-bold">
        {appState.lang === Language.FR ? "Voir" : "View"}
      </span>
    </Link>
  );
}