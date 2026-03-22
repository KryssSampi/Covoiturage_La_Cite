// features/dashboard/components/passenger/reservations.section.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaUserFriends, FaStar, FaArrowRight } from "react-icons/fa";
import { FaLocationDot, FaBan } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import { useReservations } from "../../hooks/useReservations";
import { formatDate } from "@/core/utils/date.utils";
import { ReservationStatus, type Reservation } from "../../types";
import { CancelConfirmToast } from "@/shared/components/CancelConfirmToast";
import { PassengerAvatars } from "@/shared/components/PassengerAvatars";
import { getReservationStatusLabel, getReservationStatusClasses } from "@/shared/utils/status.utils";

// ─── Constante de fallback pour les photos de profil ─────────────────────────
const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// ─── Sous-composant : carte réservation ─────────────────────────────────────

interface ReservationCardProps {
  reservation: Reservation;
  isPassengerListOpen: boolean;
  onTogglePassengerList: () => void;
  onClosePassengerList: () => void;
  /** Appelé quand le passager confirme l'annulation */
  onCancelConfirm: (reservationId: string) => void;
  /** Appelé quand le passager clique sur Démarrer */
  onStartTrip: (reservationId: string) => void;
  /** Indique si une action est en cours de traitement */
  isActionLoading: boolean;
}

/**
 * Affiche une carte de réservation individuelle contenant les informations du conducteur,
 * les détails de l'itinéraire, les avatars des passagers et le statut de la réservation.
 *
 * Logique métier des boutons :
 * - **Démarrer** : visible si `isImminent` — appelle l'API start, redirige vers /trajet-en-cours/[tripId]
 * - **Voir (carte)** : visible si le statut est InProgress — redirige vers /trajet-en-cours/[tripId]
 * - **Annuler** : visible si le statut est pending ou confirmed — appelle l'API cancel
 */
export function ReservationCard({
  reservation,
  isPassengerListOpen,
  onTogglePassengerList,
  onClosePassengerList,
  onCancelConfirm,
  onStartTrip,
  isActionLoading,
}: ReservationCardProps) {
  const { lang } = useAppState();
  const router = useRouter();

  // État du toast de confirmation d'annulation
  const [showCancelToast, setShowCancelToast] = useState(false);

  // Navigation vers la vue détaillée du trajet avec contexte URL
  const handleCardClick = () => {
    const status = reservation.isImminent ? 'imminent' : reservation.status;
    router.push(`/trajets/${reservation.tripId}?source=reservation&status=${status}`);
  };

  // Confirmation d'annulation — délègue au hook
  const handleCancelConfirm = () => {
    setShowCancelToast(false);
    onCancelConfirm(reservation.id);
  };

  // Démarrer le trajet — délègue au hook
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartTrip(reservation.id);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="w-full flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-4 hover:shadow-2xl hover:scale-105 transition-all active:scale-95 cursor-pointer"
      >
      <Image src={reservation.driver.pictureUrl || AVATAR_FALLBACK} alt={reservation.driver.name} className="w-2/11 h-35 rounded-xl object-cover" width={400} height={400} onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }} />

      <div className="w-px h-30 bg-black shrink-0" />

      <div className="flex flex-col relative items-start w-full">
        <span className="text-xl font-semibold text-black">
          {formatDate(reservation.date, lang)} : {reservation.time}
        </span>

        <div className="flex items-center text-black text-2xl gap-2">
          {lang === Language.FR ? "Avec :" : "With:"}
          <Link href={`/public-profile?accountid=${reservation.driver.id}`} className="text-2xl font-semibold text-blue-500 hover:text-blue-700 hover:underline" onClick={(e) => e.stopPropagation()}>
            {reservation.driver.name}
          </Link>
          <p className="text-yellow-400 text-xl flex gap-1 items-center">
            <FaStar /> {reservation.driver.rating}
            <span>({reservation.driver.tripsCount} {lang === Language.FR ? "trajets" : "trips"})</span>
          </p>
        </div>

        <p className="flex gap-1 text-[#08316e] items-baseline text-2xl">
          <FaLocationDot />
          <span className="truncate max-w-30 text-black font-bold">{reservation.departure}</span>
          <FaArrowRight className="scale-x-250 scale-y-90 mx-4 mt-1 h-5" />
          <span className="truncate max-w-30 text-black font-bold">{reservation.destination}</span>
        </p>

        <div className="w-full flex justify-between items-center mt-2">
          <PassengerAvatars
            passengers={reservation.passengers}
            isOpen={isPassengerListOpen}
            onToggle={onTogglePassengerList}
            onClose={onClosePassengerList}
          />
          <div className="flex items-center text-2xl gap-2">
            <span className="text-gray-700">{reservation.passengers.length}/{reservation.maxPassengers}</span>
            <FaUserFriends className="text-[#08316e]" />
          </div>
        </div>
      </div>

      <div className="w-px h-30 bg-black shrink-0" />

      <div className="flex flex-col justify-center items-center w-2/11 gap-2 shrink-0">
        <span className={`text-xl px-3 py-1 rounded-full w-full text-center ${getReservationStatusClasses(reservation.status)}`}>
          &bull; {getReservationStatusLabel(reservation.status, lang)}
        </span>

        {/* Bouton Démarrer le trajet — réservation imminente et confirmée */}
        {reservation.isImminent && reservation.status === ReservationStatus.Confirmed && (
          <button
            onClick={handleStart}
            disabled={isActionLoading}
            className="flex w-10/12 h-10 justify-center text-xl items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-white animate-pulse hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-50"
            style={{ backgroundColor: '#0aad6a' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            {lang === Language.FR ? "Démarrer" : "Start"}
          </button>
        )}

        {/* Bouton carte — visible quand le trajet est en cours, redirige vers la page trajet-en-cours */}
        {reservation.status === ReservationStatus.InProgress && (
          <Link
            href={`/trajet-en-cours/${reservation.tripId}`}
            className="relative flex items-center justify-center rounded-lg hover:scale-105 active:scale-95 transition px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src="/assets/reservertion_map_button/reservation-map.png" alt="Map preview" width={80} height={80} className="w-20 h-20 object-cover rounded-lg" />
            <span className="absolute text-white text-xl font-light hover:underline">
              {lang === Language.FR ? "Voir" : "See"}
            </span>
          </Link>
        )}

        {/* Bouton annuler — visible seulement si pending ou confirmed (annulable) */}
        {(reservation.status === ReservationStatus.Pending ||
          reservation.status === ReservationStatus.Confirmed) && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowCancelToast(true); }}
            disabled={isActionLoading}
            className="flex w-10/12 h-10 justify-center text-xl items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold border-2 border-red-400 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50"
          >
            <FaBan size={18} />
            {lang === Language.FR ? "Annuler" : "Cancel"}
          </button>
        )}
      </div>
    </div>

      {/* Toast de confirmation d'annulation */}
      <CancelConfirmToast
        isOpen={showCancelToast}
        label={lang === Language.FR ? "cette réservation" : "this reservation"}
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelToast(false)}
      />
    </>
  );
}



/**
 * Section principale affichant la liste des réservations du passager sur le tableau de bord.
 *
 * Fonctionnalités :
 * - Mise à jour automatique en temps réel via SSE (db-watch/reservations)
 * - Tri par priorité de statut (en cours → confirmé → en attente → annulé → terminé)
 * - Bouton « Voir tous » redirige vers le planner (ride area) en mode « voir tout »
 *   avec les filtres passés par URL
 * - Chaque carte exécute sa logique métier (annuler, démarrer, voir carte)
 */
// ─── Section principale ──────────────────────────────────────────────────────

interface ReservationsSectionProps {
  reservations: Reservation[];
}

export function ReservationsSection({ reservations: rawReservations }: ReservationsSectionProps) {
  const { lang, userConnected } = useAppState();
  const router = useRouter();
  const passengerId = userConnected?.id ?? null;

  // Hook avec SSE temps réel + actions métier (cancel, start)
  const {
    reservations,
    isEmpty,
    openPassengerLists,
    togglePassengerList,
    closePassengerList,
    cancelReservation,
    startReservation,
    isActionLoading,
  } = useReservations(rawReservations, passengerId);

  // Annulation d'une réservation via l'API
  const handleCancelConfirm = async (reservationId: string) => {
    await cancelReservation(reservationId);
  };

  // Démarrage d'un trajet : API start → redirection vers trajet-en-cours
  const handleStartTrip = async (reservationId: string) => {
    const tripId = await startReservation(reservationId);
    if (tripId) {
      router.push(`/trajet-en-cours/${tripId}`);
    }
  };

  // Lien « Voir tous » : redirige vers le planner en mode voir tout avec filtres par URL
  const plannerHref = passengerId
    ? `/passenger/planifier/${passengerId}?showAll=true&role=passenger`
    : '/reservations';

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-white text-black">
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {lang === Language.FR ? "Mes Réservations" : "My Reservations"}
        </h2>
        <Link href={plannerHref} className="text-lg font-medium text-blue-500 hover:underline hover:text-blue-700">
          {lang === Language.FR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />

      <div className="w-full h-150 flex flex-col justify-center items-center px-10">
        {isEmpty ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-700 text-2xl text-center">
              {lang === Language.FR ? "Aucune réservation pour le moment." : "No reservations at the moment."}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col max-h-150 items-center px-10 overflow-y-auto">
            {reservations.map((reservation, index) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                isPassengerListOpen={openPassengerLists[index]}
                onTogglePassengerList={() => togglePassengerList(index)}
                onClosePassengerList={() => closePassengerList(index)}
                onCancelConfirm={handleCancelConfirm}
                onStartTrip={handleStartTrip}
                isActionLoading={isActionLoading}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />
    </section>
  );
}
