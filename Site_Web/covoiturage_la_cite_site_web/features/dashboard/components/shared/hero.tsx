"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Language, useAppState } from "@/core/state/app_state";
import { UserRole } from "@/domain/models/UserModel";

import { SuperSearchSection } from "./supersearch.section";

type HeroUser = {
  id?: string;
  role?: string;
  prenom?: string;
  firstName?: string;
  canBeDriver?: boolean;
  can_be_driver?: boolean;
} | null;

export function Hero() {
  const appState = useAppState();
  const router = useRouter();
  const isFR = appState.lang === Language.FR;
  const user = appState.userConnected as HeroUser;
  const userRole = String(user?.role ?? "").toLowerCase();
  const isDriver = userRole === UserRole.DRIVER;
  const canBeDriver = Boolean(user?.canBeDriver ?? user?.can_be_driver);
  const firstName = user?.prenom ?? user?.firstName ?? "";
  const desiredHeroImageSrc = isDriver ? "/img/driver-hero.png" : "/img/passenger-hero.png";

  const [mounted, setMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    // Envelopper la mise à jour d'état dans startTransition pour éviter les rendus en cascade
    startTransition(() => {
      setImageFailed(false);
    });
  }, [desiredHeroImageSrc]);

  if (!mounted) return null;

  const toggleRole = () => {
    if (!appState.userConnected) return;
    const newRole = isDriver ? UserRole.PASSENGER : UserRole.DRIVER;
    appState.login({ ...appState.userConnected, role: newRole });
    router.push(`/${newRole}/${appState.userConnected.id}`);
  };

  const headline = isDriver
    ? isFR
      ? "Ou Nous Emmenez-Vous Aujourd'hui,"
      : "Where Are You Taking Us Today,"
    : isFR
      ? "Pret a Partager la Route avec Vos"
      : "Ready to Share the Road with Your";

  const headlineAccent = isDriver
    ? (isFR ? "Capitaine ?" : "Captain ?")
    : (isFR ? "Camarades ?" : "Classmates ?");

  return (
    <section className="relative flex w-full max-h-175 flex-col items-center overflow-hidden lg:h-screen lg:flex-row lg:justify-between">
      <div className="absolute inset-0 z-0">
        <Image
          key={desiredHeroImageSrc}
          src={imageFailed ? "/img/acceuil-hero-img.png" : desiredHeroImageSrc}
          alt="Hero background"
          fill
          priority
          className="object-cover transition-opacity duration-700 scale-105"
          onError={() => setImageFailed(true)}
        />
      </div>

      <div className="relative z-10 mx-auto mt-20 flex flex-col px-3 lg:container lg:mt-0 lg:mb-0 lg:gap-y-8 lg:px-10">
        <h1 className="text-5xl leading-tight font-bold text-white lg:text-8xl">
          {isFR ? `Bienvenue, ${firstName} !` : `Welcome, ${firstName} !`}
        </h1>

        <p className="max-w-4xl text-3xl text-white lg:text-7xl">
          {headline} <span className="font-semibold text-blue-300">{headlineAccent}</span>
        </p>

        <div className="mt-4 flex flex-col gap-y-4">
          {canBeDriver ? (
            <div className="relative self-start -mt-2 -mb-25 lg:mt-2 lg:mb-0">
              <button
                onClick={toggleRole}
                className="relative flex items-center gap-0 overflow-hidden rounded-full border-4 border-white/30 bg-[#424243d4] backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <span
                  className={`min-w-fit rounded-full px-2 py-3 text-3xl font-semibold transition-all duration-300 lg:px-8 lg:py-8 lg:text-5xl ${
                    !isDriver ? "bg-[#08316e] text-white shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isFR ? "Passager" : "Passenger"}
                </span>

                <span
                  className={`min-w-40 rounded-full px-3 py-3 text-3xl font-semibold transition-all duration-300 lg:min-w-80 lg:px-8 lg:py-8 lg:text-5xl ${
                    isDriver ? "bg-[#08316e] text-white shadow-md" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isFR ? "Conducteur" : "Driver"}
                </span>
              </button>
            </div>
          ) : (
            <Link
              href="#devenir-conducteur"
              className="absolute rounded-full border-2 border-white bg-[#08316ec6] px-2 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#08316e] hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95 lg:relative lg:self-start lg:mt-2 lg:-mb-10 lg:border-4 lg:px-15 lg:py-8 lg:text-5xl"
            >
              {isFR ? "Devenir conducteur ?" : "Become a driver ?"}
            </Link>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-10 flex h-1/2 w-1/2 items-center justify-center scale-75 lg:mt-0 lg:mr-30 lg:-mb-25 lg:scale-100">
        <SuperSearchSection
          onSearch={(params) => {
            const base = isDriver
              ? `/driver/search/${appState.userConnected?.id}`
              : `/passenger/search/${appState.userConnected?.id}`;

            const q = new URLSearchParams({
              dep: params.departureLocation,
              arr: params.arrivalLocation,
            });

            if (params.departureCoords) {
              q.set("depLng", String(params.departureCoords[0]));
              q.set("depLat", String(params.departureCoords[1]));
            }
            if (params.arrivalCoords) {
              q.set("arrLng", String(params.arrivalCoords[0]));
              q.set("arrLat", String(params.arrivalCoords[1]));
            }

            router.push(`${base}?${q.toString()}`);
          }}
        />
      </div>
    </section>
  );
}
