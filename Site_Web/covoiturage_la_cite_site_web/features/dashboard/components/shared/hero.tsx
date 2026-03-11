"use client";

/**
 * @file hero.tsx
 * @description Section Hero du dashboard — commune à tous les rôles.
 *
 * Affiche :
 * - L'image de fond adaptée au rôle (conducteur / passager)
 * - Un titre de bienvenue personnalisé
 * - Un sous-titre contextuel selon le rôle
 * - Le toggle Passager ↔ Conducteur (si can_be_driver === true)
 *   OU un CTA "Devenir conducteur" (sinon)
 * - Le formulaire de recherche SuperSearchSection
 *
 * @remarks
 * Le pattern [mounted] protège contre l'hydratation SSR :
 * appState.userConnected est lu depuis un store côté client uniquement.
 * Sans cette garde, Next.js produirait une erreur d'hydratation.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";

import { useAppState, Language } from "@/core/state/app_state";
import { UserRole } from "@/domain/models/UserModel";

import { SuperSearchSection } from "./supersearch.section";

// ─── Composant principal ─────────────────────────────────────────────────────

export function Hero() {
  const appState = useAppState();
  const router = useRouter();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role === UserRole.DRIVER;

  // Protection hydratation SSR : empêche le rendu avant que le client soit prêt.
  // Nécessaire car appState.userConnected est lu depuis le store côté client uniquement.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Enveloppe la mise à jour d'état dans startTransition pour éviter les rendus en cascade.
    startTransition(() => {
      setMounted(true);
    });
  }, []);
  if (!mounted) return null;

  // ─── Toggle de rôle ─────────────────────────────────────────────────────

  /**
   * Bascule entre les rôles PASSAGER et CONDUCTEUR.
   * Met à jour l'AppState via login() (pas de mutation directe du store)
   * puis redirige vers le dashboard du nouveau rôle.
   */
  const toggleRole = () => {
    if (!appState.userConnected) return;
    const newRole = isDriver ? UserRole.PASSENGER : UserRole.DRIVER;
    appState.login({ ...appState.userConnected, role: newRole });
    router.push(`/${newRole}/${appState.userConnected.id}`);
  };

  // ─── Textes dynamiques selon le rôle ────────────────────────────────────

  const headline = isDriver
    ? isFR
      ? "Où Nous Emmenez-Vous Aujourd'hui,"
      : "Where Are You Taking Us Today,"
    : isFR
    ? "Prêt à Partager la Route avec Vos"
    : "Ready to Share the Road with Your";

  const headlineAccent = isDriver
    ? isFR ? "Capitaine ?" : "Captain ?"
    : isFR ? "Camarades ?" : "Classmates ?";

  return (
    <section className="relative w-full h-screen max-h-175 flex lg:flex-row flex-col lg:justify-between items-center overflow-hidden">
      {/* ─── Image de fond adaptée au rôle ──────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isDriver ? "/img/driver-hero.png" : "/img/passenger-hero.png"}
          alt="Hero background"
          fill
          className="object-cover transition-opacity duration-700 scale-105"
          priority
        />
      </div>

      {/* ─── Contenu textuel ─────────────────────────────────────────────── */}
      <div className="relative z-10 lg:container mx-auto px-3 lg:px-10 flex lg:mb-0 flex-col lg:gap-y-8 lg:mt-0 mt-20">
        <h1 className="text-5xl lg:text-8xl font-bold text-white leading-tight">
          {isFR
            ? `Bienvenue, ${appState.userConnected?.prenom} !`
            : `Welcome, ${appState.userConnected?.prenom} !`}
        </h1>

        <p className="text-3xl lg:text-7xl text-white max-w-4xl">
          {headline}{" "}
          <span className="text-blue-300 font-semibold">{headlineAccent}</span>
        </p>

        {/* ─── Zone d'action : toggle rôle ou CTA conducteur ──────────── */}
        <div className="flex flex-col gap-y-4 mt-4">
          {appState.userConnected?.can_be_driver ? (
            // Utilisateur qualifié conducteur : affiche le toggle bi-rôle
            <div className="self-start lg:mt-2 -mt-2 lg:mb-0 -mb-25 relative">
              <button
                onClick={toggleRole}
                className="relative flex items-center gap-0 bg-[#424243d4] backdrop-blur-sm
                           border-4 border-white/30 rounded-full overflow-hidden
                           hover:border-white/60 transition-all duration-300
                           hover:shadow-lg hover:shadow-blue-500/30"
              >
                {/* Onglet PASSAGER */}
                <span
                  className={`lg:px-8 lg:py-8 px-2 py-3 lg:text-5xl text-3xl min-w-fit font-semibold transition-all duration-300 rounded-full ${
                    !isDriver
                      ? "bg-[#08316e] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isFR ? "Passager" : "Passenger"}
                </span>

                {/* Onglet CONDUCTEUR */}
                <span
                  className={`lg:px-8 lg:py-8 px-3 py-3 lg:text-5xl text-3xl lg:min-w-80 min-w-40 font-semibold transition-all duration-300 rounded-full ${
                    isDriver
                      ? "bg-[#08316e] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isFR ? "Conducteur" : "Driver"}
                </span>
              </button>
            </div>
          ) : (
            // Utilisateur non qualifié : CTA pour initier la demande conducteur
            <Link
              href="#devenir-conducteur"
              className="lg:self-start lg:mt-2 lg:-mb-10 lg:border-4 border-2 absolute px-2 py-4
                         lg:relative bg-[#08316ec6] border-white text-white lg:px-15 lg:py-8
                         rounded-full lg:text-5xl font-semibold
                         hover:shadow-2xl hover:shadow-blue-500/40
                         hover:scale-105 hover:bg-[#08316e]
                         transition-all duration-300 active:scale-95"
            >
              {isFR ? "Devenir conducteur ?" : "Become a driver ?"}
            </Link>
          )}
        </div>
      </div>

      {/* ─── Formulaire de recherche ─────────────────────────────────────── */}
      <div className="relative lg:scale-100 scale-75 lg:mt-0 mt-10 z-10 lg:mr-30 lg:-mb-25 w-1/2 h-1/2 flex items-center justify-center">
        {/*
         * TODO: Passer les vraies destinations favorites de l'utilisateur
         * en props favDestinations pour pré-remplir les suggestions rapides.
         * GET /api/users/{userId}/favorites → mapper en { label, value, icon }
         */}
        <SuperSearchSection onSearch={(params) => {
          // Redirige vers la page de recherche du rôle courant avec les paramètres encodés
          const base = isDriver
            ? `/driver/search/${appState.userConnected?.id}`
            : `/passenger/search/${appState.userConnected?.id}`;

          const q = new URLSearchParams({
            dep: params.departureLocation,
            arr: params.arrivalLocation,
          });
          // Ajoute les coordonnées si disponibles (sélection via suggestion)
          // Les clés doivent correspondre exactement à ce que lisent les pages de recherche
          if (params.departureCoords) {
            q.set("depLng", String(params.departureCoords[0]));
            q.set("depLat", String(params.departureCoords[1]));
          }
          if (params.arrivalCoords) {
            q.set("arrLng", String(params.arrivalCoords[0]));
            q.set("arrLat", String(params.arrivalCoords[1]));
          }
          router.push(`${base}?${q.toString()}`);
        }} />
      </div>
    </section>
  );
}
