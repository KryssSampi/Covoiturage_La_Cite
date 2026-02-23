"use client";

/**
 * @file published_trips.section.tsx
 * @description Section "Mes Trajets Publiés" — exclusif au rôle Conducteur.
 *
 * Affiche la liste des trajets publiés du conducteur, triés par priorité :
 * 1. En cours (GPS actif — bouton carte visible)
 * 2. À venir confirmés / complets
 * 3. Publiés en attente de passagers
 * 4. Annulés
 * 5. Terminés
 *
 * Chaque carte affiche : images Unsplash de la ville départ/arrivée,
 * passagers confirmés avec avatars, badge statut coloré, tarif,
 * demandes en attente, et un bouton carte pour les trajets InProgress.
 *
 * @uses usePublishedTrips — tri, formatage statut, état UI liste passagers
 * @uses PublishedTrip, PublishedTripStatus — types depuis dashboard/types
 * @uses FIXTURE_PUBLISHED_TRIPS — données de test (à remplacer par API)
 */

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { getCityImage } from "@/core/lib/unsplash";
import { formatDate } from "@/core/utils/date.utils";

import { usePublishedTrips } from "../../hooks/usePublishedTrips";
import {
  PublishedTrip,
  PublishedTripStatus,
  PublishedTripCardModel,
  Passenger,
} from "../../types";
import { FIXTURE_PUBLISHED_TRIPS } from "@/tests/fixtures/dashboard/publishedtrips.fixtures";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * PublishedTripSection
 *
 * @param trips Liste des trajets publiés du conducteur.
 *   Par défaut : FIXTURE_PUBLISHED_TRIPS.
 *   TODO: Brancher sur GET /api/driver/{userId}/trips?status=active&limit=10
 */
export function PublishedTripSection({ trips = FIXTURE_PUBLISHED_TRIPS }: { trips?: PublishedTrip[] }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const {
    tripModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    formatStatus,
    getStatusColor,
  } = usePublishedTrips(trips);

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-white text-black">
      {/* ─── En-tête ──────────────────────────────────────────────────── */}
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {isFR ? "Mes Trajets Publiés" : "My Published Trips"}
        </h2>
        <Link
          href="/driver/trips"
          className="text-lg font-medium text-blue-500 hover:underline hover:text-blue-700"
        >
          {isFR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />

      {/* ─── Liste ou état vide ───────────────────────────────────────── */}
      <div className="w-full h-100 container justify-center items-center px-10">
        {tripModels.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-700 text-2xl text-center">
              {isFR ? "Aucun trajet publié pour le moment." : "No published trips at the moment."}
            </p>
          </div>
        ) : (
          <div
            className="w-full flex flex-col max-h-100 items-center px-10 overflow-y-auto"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {tripModels.map((model) => (
              <PublishedTripCard
                key={model.trip.id}
                model={model}
                isPassengerListOpens={isPassengerListOpens}
                setIsPassengerListOpens={setIsPassengerListOpens}
                formatStatus={formatStatus}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />
    </section>
  );
}

// ─── Carte de trajet ─────────────────────────────────────────────────────────

/**
 * PublishedTripCard
 * Affiche les détails d'un trajet publié dans la liste du conducteur.
 * Les images Unsplash (départ / destination) sont chargées en parallèle au montage.
 */
function PublishedTripCard({
  model,
  isPassengerListOpens,
  setIsPassengerListOpens,
  formatStatus,
  getStatusColor,
}: {
  model: PublishedTripCardModel;
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  setIsPassengerListOpens: React.Dispatch<React.SetStateAction<{ isPassengerListOpen: boolean }[]>>;
  formatStatus: (status: PublishedTripStatus, lang: Language) => string;
  getStatusColor: (status: PublishedTripStatus) => string;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { trip } = model;

  const [departureImg,   setDepartureImg]   = useState("");
  const [destinationImg, setDestinationImg] = useState("");

  // Chargement en parallèle des images Unsplash des deux villes
  useEffect(() => {
    Promise.all([
      getCityImage(trip.departure),
      getCityImage(trip.destination),
    ]).then(([dep, dest]) => {
      setDepartureImg(dep);
      setDestinationImg(dest);
    });
  }, [trip.departure, trip.destination]);

  const togglePassengerList = () => {
    setIsPassengerListOpens((prev) =>
      prev.map((item, i) =>
        i === trip.id - 1 ? { isPassengerListOpen: !item.isPassengerListOpen } : item,
      ),
    );
  };

  const closePassengerList = () => {
    setIsPassengerListOpens((prev) =>
      prev.map((item, i) => (i === trip.id - 1 ? { isPassengerListOpen: false } : item)),
    );
  };

  const isListOpen = isPassengerListOpens[trip.id - 1]?.isPassengerListOpen ?? false;

  return (
    <div className="w-full h-fit flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-4 hover:shadow-2xl hover:scale-[1.02] transition-all">

      {/* ─── Images départ / arrivée (clip-path diagonal) ─────────────── */}
      <div className="relative w-[27%] h-32 rounded-xl overflow-hidden group bg-gray-200">
        {departureImg && (
          <Image
            src={departureImg}
            alt={trip.departure}
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110
                       [clip-path:polygon(0_0,65%_0,35%_100%,0_100%)] z-10"
          />
        )}
        {destinationImg && (
          <Image
            src={destinationImg}
            alt={trip.destination}
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110
                       [clip-path:polygon(65%_0,100%_0,100%_100%,35%_100%)] z-0"
          />
        )}
      </div>

      <div className="w-px h-30 bg-black" />

      {/* ─── Informations du trajet ───────────────────────────────────── */}
      <div className="flex flex-col relative items-start justify-start mb-2 w-full">

        {/* Date, itinéraire, places */}
        <div className="w-full justify-between flex items-center mt-2">
          <div className="flex flex-col items-start w-full">
            <span className="text-xl font-semibold text-black">
              {formatDate(trip.date, appState.lang)} : {trip.time}
            </span>
            <p className="flex gap-1 text-[#08316e] items-baseline text-2xl">
              <FaLocationDot />
              <span className="truncate max-w-30 text-black font-bold">{trip.departure}</span>
              <FaArrowRight className="scale-x-250 scale-y-90 mx-4 mt-1 h-5" />
              <span className="truncate max-w-30 text-black font-bold">{trip.destination}</span>
            </p>
            <div className="flex items-center text-2xl gap-2">
              <span className="text-gray-700">
                {trip.passengers.length}/{trip.maxPassengers}
              </span>
              <span className="text-[#08316e] font-semibold text-lg">
                {isFR ? "Passagers Confirmés" : "Confirmed Passengers"}
              </span>
            </div>
          </div>

          {/* Tarif */}
          <div className="w-fit flex flex-col items-center justify-center">
            <span className="text-black font-bold text-xl underline">
              {isFR ? "Tarif" : "Fare"}
            </span>
            <span className="text-xl font-bold text-green-500">{trip.price} CAD</span>
          </div>
        </div>

        {/* Avatars passagers + demandes en attente */}
        <div className="w-full justify-between flex items-center mt-1">
          <PassengerAvatars
            passengers={trip.passengers}
            tripId={trip.id}
            isListOpen={isListOpen}
            onToggle={togglePassengerList}
            onClose={closePassengerList}
            lang={appState.lang}
          />
          {trip.pendingRequests > 0 && (
            <p className="font-bold text-2xl text-[#08316e]">
              <span className="text-blue-500 font-medium">{trip.pendingRequests}</span>
              {isFR ? " demande(s) en attente" : " pending requests"}
              <span className="ml-2 text-4xl text-blue-900">&bull;</span>
            </p>
          )}
        </div>
      </div>

      <div className="w-px h-30 bg-black my-2" />

      {/* ─── Badge statut + bouton carte (InProgress) ────────────────── */}
      <div className="flex flex-col justify-between w-3/11 items-center gap-y-3">
        <span
          className={`text-xl ${getStatusColor(trip.status)} justify-center flex py-1 rounded-full w-full items-center text-center`}
        >
          &bull; {formatStatus(trip.status, appState.lang)}
        </span>
        {trip.status === PublishedTripStatus.InProgress && (
          <Link
            href={`/map?reservationId=${trip.id}`}
            className="w-fit relative flex items-center justify-center rounded-lg
                       hover:scale-105 active:scale-95 transition px-2 py-1"
          >
            <Image
              src="/assets/reservertion_map_button/reservation-map.png"
              alt="Map preview"
              width={500}
              height={500}
              className="w-20 h-20 object-cover inset-0 rounded-lg"
            />
            <span className="text-white text-xl font-light absolute hover:underline">
              {isFR ? "Voir" : "See"}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composant avatars passagers ────────────────────────────────────────

/**
 * Affiche les 2 premiers avatars passagers avec :
 * - Lien vers le profil public
 * - Nom si passager unique
 * - Badge "+N autres" cliquable si > 2 passagers (ouvre une liste déroulante)
 */
function PassengerAvatars({
  passengers,
  isListOpen,
  onToggle,
  onClose,
  lang,
}: {
  passengers: Passenger[];
  tripId: number;
  isListOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  lang: Language;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${passengers.length === 1 ? "bg-white px-2 rounded-full" : ""}`}
    >
      {passengers.slice(0, 2).map((p) => (
        <Link key={p.id} href={`/public-profile?accountid=${p.id}`} className="flex items-center gap-2">
          <Image
            src={p.pictureUrl}
            alt={`${p.name} profile picture`}
            className="w-10 h-10 rounded-full"
            width={400}
            height={400}
          />
        </Link>
      ))}

      {passengers.length === 1 && (
        <Link href={`/public-profile?accountid=${passengers[0].id}`} className="flex items-center gap-2">
          <span className="text-sm text-gray-700 hover:text-blue-500 hover:underline">
            {passengers[0].name}
          </span>
        </Link>
      )}

      {passengers.length > 2 && (
        <>
          <span
            className="text-sm text-gray-700 hover:text-blue-400 hover:underline cursor-pointer"
            onClick={onToggle}
          >
            +{passengers.length - 2} {lang === Language.FR ? "autres" : "more"}
          </span>

          {/* Liste déroulante de tous les passagers */}
          <div
            className={`flex flex-col absolute left-1 bottom-10 rounded-lg bg-white p-2 items-center mt-2
              shadow-lg transition-all
              ${isListOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onMouseLeave={onClose}
          >
            {passengers.map((p) => (
              <Link
                key={p.id}
                href={`/public-profile?accountid=${p.id}`}
                className="flex justify-between items-center gap-2 w-full"
              >
                <Image
                  src={p.pictureUrl}
                  alt={`${p.name} profile picture`}
                  className="w-10 h-10 rounded-full"
                  width={400}
                  height={400}
                />
                <span className="text-sm text-gray-700 hover:text-blue-500 text-start hover:underline">
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
