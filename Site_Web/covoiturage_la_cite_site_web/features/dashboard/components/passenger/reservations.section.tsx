// features/dashboard/components/passenger/reservations.section.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FaUserFriends, FaStar, FaArrowRight } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import { useReservations } from "../../hooks/useReservations";
import { formatDate } from "@/core/utils/date.utils";
import { ReservationStatus, type Reservation, type Passenger } from "../../types";

// ─── Utilitaires statut ──────────────────────────────────────────────────────
/**
 * Retourne le libellé localisé correspondant au statut d'une réservation.
 *
 * @param status - Le statut de la réservation à traduire.
 * @param lang - La langue dans laquelle retourner le libellé ({@link Language.FR} ou {@link Language.EN}).
 * @returns Le libellé du statut dans la langue spécifiée.
 */


function getStatusLabel(status: ReservationStatus, lang: Language): string {
  const labels: Record<ReservationStatus, Record<Language, string>> = {
    [ReservationStatus.Confirmed]:  { [Language.FR]: "Confirmée",  [Language.EN]: "Confirmed"   },
    [ReservationStatus.Pending]:    { [Language.FR]: "En attente", [Language.EN]: "Pending"     },
    [ReservationStatus.Cancelled]:  { [Language.FR]: "Annulée",    [Language.EN]: "Cancelled"   },
    [ReservationStatus.Completed]:  { [Language.FR]: "Terminée",   [Language.EN]: "Completed"   },
    [ReservationStatus.InProgress]: { [Language.FR]: "En cours",   [Language.EN]: "In Progress" },
  };
  return labels[status][lang];
}

/**
 * Retourne les classes CSS Tailwind correspondant au style visuel d'un statut de réservation.
 *
 * @param status - Le statut de la réservation pour lequel obtenir les classes CSS.
 * @returns Une chaîne de classes CSS Tailwind définissant la couleur de fond et la couleur du texte du badge de statut.
 */

function getStatusClasses(status: ReservationStatus): string {
  const classes: Record<ReservationStatus, string> = {
    [ReservationStatus.Confirmed]:  "bg-green-400 text-white",
    [ReservationStatus.Pending]:    "bg-gray-600 text-white",
    [ReservationStatus.Cancelled]:  "bg-orange-400 text-white",
    [ReservationStatus.Completed]:  "bg-[#08316e] text-white",
    [ReservationStatus.InProgress]: "bg-red-400 text-white",
  };
  return classes[status];
}

// ─── Sous-composant : avatars passagers ─────────────────────────────────────

interface PassengerAvatarsProps {
  passengers: Passenger[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}
/**
 * Affiche les avatars des passagers d'une réservation avec une liste déroulante extensible.
 *
 * @param props - Les propriétés du composant.
 * @param props.passengers - La liste des passagers à afficher sous forme d'avatars.
 * @param props.isOpen - Indique si la liste déroulante des passagers supplémentaires est ouverte.
 * @param props.onToggle - Fonction de rappel pour basculer la visibilité de la liste déroulante.
 * @param props.onClose - Fonction de rappel pour fermer la liste déroulante.
 *
 * @remarks
 * - Si un seul passager est présent, son avatar et son nom sont affichés côte à côte avec un lien vers son profil public.
 * - Si deux passagers ou moins sont présents, leurs avatars sont affichés directement.
 * - Si plus de deux passagers sont présents, les deux premiers avatars sont affichés avec un indicateur « +N autres »
 *   cliquable qui ouvre une liste déroulante contenant tous les passagers avec leurs avatars et noms.
 * - La liste déroulante se ferme automatiquement lorsque la souris quitte la zone.
 *
 * @returns Le composant rendu affichant les avatars des passagers.
 */


function PassengerAvatars({ passengers, isOpen, onToggle, onClose }: PassengerAvatarsProps) {
  const { lang } = useAppState();

  return (
    <div className={`relative flex items-center gap-2 mt-2 ${passengers.length === 1 ? "bg-white px-2 rounded-full" : ""}`}>
      {passengers.slice(0, 2).map((p) => (
        <Link key={p.id} href={`/public-profile?accountid=${p.id}`}>
          <Image src={p.pictureUrl} alt={p.name} className="w-10 h-10 rounded-full" width={40} height={40} />
        </Link>
      ))}

      {passengers.length === 1 && (
        <Link href={`/public-profile?accountid=${passengers[0].id}`} className="text-sm text-gray-700 hover:text-blue-500 hover:underline">
          {passengers[0].name}
        </Link>
      )}

      {passengers.length > 2 && (
        <span className="text-sm text-gray-700 hover:text-blue-400 hover:underline cursor-pointer" onClick={onToggle}>
          +{passengers.length - 2} {lang === Language.FR ? "autres" : "more"}
        </span>
      )}

      {passengers.length > 2 && isOpen && (
        <div className="absolute left-0 bottom-10 z-10 flex flex-col rounded-lg bg-white shadow-lg p-2 gap-1" onMouseLeave={onClose}>
          {passengers.map((p) => (
            <Link key={p.id} href={`/public-profile?accountid=${p.id}`} className="flex items-center gap-2">
              <Image src={p.pictureUrl} alt={p.name} className="w-8 h-8 rounded-full" width={32} height={32} />
              <span className="text-sm text-gray-700 hover:text-blue-500 hover:underline">{p.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sous-composant : carte réservation ─────────────────────────────────────

interface ReservationCardProps {
  reservation: Reservation;
  isPassengerListOpen: boolean;
  onTogglePassengerList: () => void;
  onClosePassengerList: () => void;
}

/**
 * Affiche une carte de réservation individuelle contenant les informations du conducteur,
 * les détails de l'itinéraire, les avatars des passagers et le statut de la réservation.
 *
 * @param props - Les propriétés du composant.
 * @param props.reservation - Les données de la réservation incluant le conducteur, l'itinéraire, les passagers et le statut.
 * @param props.isPassengerListOpen - Indique si la liste déroulante des passagers est actuellement ouverte.
 * @param props.onTogglePassengerList - Fonction de rappel pour basculer la visibilité de la liste déroulante des passagers.
 * @param props.onClosePassengerList - Fonction de rappel pour fermer la liste déroulante des passagers.
 *
 * @remarks
 * La carte affiche la photo de profil du conducteur, son nom (sous forme de lien vers son profil public),
 * sa note, le nombre de trajets effectués, les lieux de départ et de destination, les avatars des passagers
 * avec un indicateur de capacité, ainsi que le badge de statut de la réservation.
 * Lorsque le statut de la réservation est {@link ReservationStatus.InProgress}, un lien supplémentaire
 * d'aperçu de carte est affiché pour naviguer vers la vue de carte en direct.
 *
 * @returns Le composant de carte de réservation rendu.
 */


function ReservationCard({ reservation, isPassengerListOpen, onTogglePassengerList, onClosePassengerList }: ReservationCardProps) {
  const { lang } = useAppState();

  return (
    <div className="w-full flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-4 hover:shadow-2xl hover:scale-105 transition-all active:scale-95">
      <Image src={reservation.driver.pictureUrl} alt={reservation.driver.name} className="w-2/11 h-35 rounded-xl object-cover" width={400} height={400} />

      <div className="w-px h-30 bg-black shrink-0" />

      <div className="flex flex-col relative items-start w-full">
        <span className="text-xl font-semibold text-black">
          {formatDate(reservation.date, lang)} : {reservation.time}
        </span>

        <div className="flex items-center text-black text-2xl gap-2">
          {lang === Language.FR ? "Avec :" : "With:"}
          <Link href={`/public-profile?accountid=${reservation.driver.id}`} className="text-2xl font-semibold text-blue-500 hover:text-blue-700 hover:underline">
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
        <span className={`text-xl px-3 py-1 rounded-full w-full text-center ${getStatusClasses(reservation.status)}`}>
          &bull; {getStatusLabel(reservation.status, lang)}
        </span>

        {reservation.status === ReservationStatus.InProgress && (
          <Link href={`/map?reservationId=${reservation.id}`} className="relative flex items-center justify-center rounded-lg hover:scale-105 active:scale-95 transition px-2 py-1">
            <Image src="/assets/reservertion_map_button/reservation-map.png" alt="Map preview" width={80} height={80} className="w-20 h-20 object-cover rounded-lg" />
            <span className="absolute text-white text-xl font-light hover:underline">
              {lang === Language.FR ? "Voir" : "See"}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}



/**
 * Section principale affichant la liste des réservations du passager sur le tableau de bord.
 *
 * @remarks
 * Ce composant récupère les réservations via le hook {@link useReservations} et les affiche
 * sous forme de cartes ({@link ReservationCard}) dans un conteneur défilable verticalement.
 * Un message est affiché lorsqu'aucune réservation n'est disponible.
 * Un lien « Voir tous » permet de naviguer vers la page complète des réservations.
 * La section est entièrement localisée en français et en anglais selon la langue de l'application.
 *
 * @returns La section des réservations rendue.
 */
// ─── Section principale ──────────────────────────────────────────────────────

export function ReservationsSection() {
  const { lang }                                                                       = useAppState();
  const { reservations, isEmpty, openPassengerLists, togglePassengerList, closePassengerList } = useReservations();

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-white text-black">
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {lang === Language.FR ? "Mes Réservations" : "My Reservations"}
        </h2>
        <Link href="/reservations" className="text-lg font-medium text-blue-500 hover:underline hover:text-blue-700">
          {lang === Language.FR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />

      <div className="w-full h-150 container justify-center items-center px-10">
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
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />
    </section>
  );
}
