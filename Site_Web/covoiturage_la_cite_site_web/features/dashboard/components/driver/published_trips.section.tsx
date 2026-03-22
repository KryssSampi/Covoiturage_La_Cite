"use client";

/**
 * @file published_trips.section.tsx
 * @description Section "Mes Trajets Publiés" — exclusif au rôle Conducteur.
 *
 * Composant autonome : reçoit uniquement un driverId et gère son propre état
 * via SSE (Server-Sent Events). Les données se mettent à jour en temps réel
 * sans actualisation de page (création, modification, annulation de trajets).
 *
 * Affiche tous les trajets sauf les complétés, triés par priorité :
 * 1. En cours (GPS actif — bouton carte visible)
 * 2. Complets / À venir confirmés
 * 3. Publiés en attente de passagers
 * 4. Annulés
 *
 * Chaque carte : images Unsplash, badge statut, passagers, tarif,
 * bouton Démarrer (imminent), toast de blocage si trajet déjà en cours.
 *
 * @uses useLiveTrips — flux SSE trips + reservations
 * @uses usePublishedTrips — tri, formatage statut, état UI liste passagers
 */

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { FaLocationDot, FaBan } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { getCityImage } from "@/core/lib/unsplash";
import { formatDate } from "@/core/utils/date.utils";

import { useLiveTrips } from "../../hooks/useLiveTrips";
import { usePublishedTrips } from "../../hooks/usePublishedTrips";
import {
  PublishedTripStatus,
  PublishedTripCardModel,
} from "../../types";
import { CancelConfirmToast } from "@/shared/components/CancelConfirmToast";
import { PassengerAvatars } from "@/shared/components/PassengerAvatars";

// ─── Squelette de chargement ─────────────────────────────────────────────────

/** Placeholder animé affiché pendant le chargement SSE */
function TripsSkeleton() {
  return (
    <div className="w-full flex flex-col items-center px-10 gap-4 py-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-full h-36 rounded-xl bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── Toast plein écran : trajet déjà en cours ────────────────────────────────

/** Overlay bloquant affiché quand le conducteur essaie de démarrer un 2e trajet */
function InProgressBlockToast({
  isOpen,
  onClose,
  isFR,
}: {
  isOpen: boolean;
  onClose: () => void;
  isFR: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {isFR ? "Trajet déjà en cours" : "Trip already in progress"}
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          {isFR
            ? "Vous avez déjà un trajet en cours. Veuillez le terminer avant d'en démarrer un nouveau."
            : "You already have a trip in progress. Please finish it before starting a new one."}
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-[#08316e] text-white text-lg font-semibold rounded-full hover:bg-[#0a4a9e] transition-colors"
        >
          {isFR ? "Compris" : "Got it"}
        </button>
      </div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * PublishedTripSection
 *
 * Composant autonome — reçoit uniquement le driverId.
 * Se connecte au flux SSE et maintient la liste des trajets à jour en temps réel.
 */
export function PublishedTripSection({ driverId }: { driverId: string }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Flux SSE en temps réel
  const { trips: liveTrips, isLoading, error, hasInProgressTrip } = useLiveTrips(driverId);

  // Tri et formatage
  const {
    tripModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    formatStatus,
    getStatusColor,
  } = usePublishedTrips(liveTrips ?? []);

  // État du toast de blocage (trajet déjà en cours)
  const [showBlockToast, setShowBlockToast] = useState(false);

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-white text-black">
      {/* ─── En-tête ──────────────────────────────────────────────────── */}
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {isFR ? "Mes Trajets Publiés" : "My Published Trips"}
        </h2>
        <Link
          href="/trajets?view=tous"
          className="text-lg font-medium text-blue-500 hover:underline hover:text-blue-700"
        >
          {isFR ? "Voir plus" : "See more"} {">"}
        </Link>
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />

      {/* ─── Contenu : loader / erreur / liste / état vide ────────────── */}
      <div className="w-full h-100 flex flex-col justify-center items-center px-10">
        {isLoading ? (
          <TripsSkeleton />
        ) : error ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-red-500 text-lg text-center">{error}</p>
          </div>
        ) : tripModels.length === 0 ? (
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
            {tripModels.map((model, index) => (
              <PublishedTripCard
                key={model.trip.id}
                model={model}
                index={index}
                isPassengerListOpens={isPassengerListOpens}
                setIsPassengerListOpens={setIsPassengerListOpens}
                formatStatus={formatStatus}
                getStatusColor={getStatusColor}
                hasInProgressTrip={hasInProgressTrip}
                onBlockStart={() => setShowBlockToast(true)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />

      {/* Toast de blocage — trajet déjà en cours */}
      <InProgressBlockToast
        isOpen={showBlockToast}
        onClose={() => setShowBlockToast(false)}
        isFR={isFR}
      />
    </section>
  );
}

// ─── Carte de trajet ─────────────────────────────────────────────────────────

/**
 * PublishedTripCard
 * Affiche les détails d'un trajet publié dans la liste du conducteur.
 * Les images Unsplash (départ / destination) sont chargées en parallèle au montage.
 */
export function PublishedTripCard({
  model,
  index,
  isPassengerListOpens,
  setIsPassengerListOpens,
  formatStatus,
  getStatusColor,
  hasInProgressTrip,
  onBlockStart,
}: {
  model: PublishedTripCardModel;
  index: number;
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  setIsPassengerListOpens: React.Dispatch<React.SetStateAction<{ isPassengerListOpen: boolean }[]>>;
  formatStatus: (status: PublishedTripStatus, lang: Language) => string;
  getStatusColor: (status: PublishedTripStatus) => string;
  hasInProgressTrip: boolean;
  onBlockStart: () => void;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const router = useRouter();
  const { trip } = model;

  const [departureImg,   setDepartureImg]   = useState("");
  const [destinationImg, setDestinationImg] = useState("");
  const [showCancelToast, setShowCancelToast] = useState(false);

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
        i === index ? { isPassengerListOpen: !item.isPassengerListOpen } : item,
      ),
    );
  };

  const closePassengerList = () => {
    setIsPassengerListOpens((prev) =>
      prev.map((item, i) => (i === index ? { isPassengerListOpen: false } : item)),
    );
  };

  const isListOpen = isPassengerListOpens[index]?.isPassengerListOpen ?? false;

  // Navigation vers la vue détaillée du trajet avec contexte URL
  const handleCardClick = () => {
    const status = trip.isImminent ? 'imminent' : trip.status;
    router.push(`/trajets/${trip.id}?source=publishedtrip&status=${status}`);
  };

  // Démarrage du trajet — bloque si un autre trajet est déjà en cours
  const handleStartTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasInProgressTrip) {
      onBlockStart();
      return;
    }
    router.push(`/trajet-en-cours/${trip.id}`);
  };

  // Annulation du trajet — envoie PATCH /api/trips/{id}/status { action: 'cancel' }
  const handleCancelConfirm = async () => {
    try {
      const res = await fetch(`/api/trips/${trip.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) {
        console.error('[PublishedTripCard] Échec annulation:', await res.text());
      }
    } catch (err) {
      console.error('[PublishedTripCard] Erreur annulation:', err);
    } finally {
      setShowCancelToast(false);
    }
  };

  return (
    <>
    <div
      onClick={handleCardClick}
      className="w-full h-fit flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-4 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
    >

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
          <div className="w-full flex flex-col items-center justify-center">
            <span className="text-black font-bold text-xl underline">
              {isFR ? "Tarif" : "Fare"}
            </span>
            <span className="text-lg w-fit font-bold text-green-500">{trip.price} CAD</span>
          </div>
        </div>

        {/* Avatars passagers + demandes en attente */}
        <div className="w-full justify-between flex items-center mt-1">
          <PassengerAvatars
            passengers={trip.passengers}
            isOpen={isListOpen}
            onToggle={togglePassengerList}
            onClose={closePassengerList}
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
        {/* Bouton Démarrer le trajet — trajet imminent */}
        {trip.isImminent && trip.status !== PublishedTripStatus.InProgress && (
          <button
            onClick={handleStartTrip}
            className="flex w-10/12 h-10 justify-center text-xl items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-white animate-pulse hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm"
            style={{ backgroundColor: '#0aad6a' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            {isFR ? "Démarrer" : "Start"}
          </button>
        )}

        {/* Bouton carte — trajet en cours */}
        {trip.status === PublishedTripStatus.InProgress && (
          <Link
            href={`/trajet-en-cours/${trip.id}`}
            onClick={(e) => e.stopPropagation()}
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

        {/* Bouton annuler — masqué si annulé ou terminé */}
        {trip.status !== PublishedTripStatus.Cancelled &&
         trip.status !== PublishedTripStatus.Completed && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowCancelToast(true); }}
            className="flex w-10/12 h-10 justify-center text-xl items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold border-2 border-red-400 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
          >
            <FaBan size={18} />
            {isFR ? "Annuler" : "Cancel"}
          </button>
        )}
      </div>
    </div>

    {/* Toast de confirmation d'annulation */}
    <CancelConfirmToast
      isOpen={showCancelToast}
      label={isFR ? "ce trajet" : "this trip"}
      onConfirm={handleCancelConfirm}
      onCancel={() => setShowCancelToast(false)}
    />
    </>
  );
}


