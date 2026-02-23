// features/dashboard/components/passenger/recommended-rides.section.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FaStar, FaLocationDot, FaArrowRight } from "react-icons/fa6";
import { FaPlusCircle, FaUserFriends } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Language, useAppState } from "@/core/state/app_state";
import { useRecommendedRides } from "../../hooks/useRecommendedRides";
import type { Trip, Passenger } from "../../types";
import { formatDate } from "@/core/utils/date.utils";

// ─── Sous-composant : avatars des passagers ─────────────────────────────────

/** Props pour le composant d'affichage des avatars passagers */
interface PassengerAvatarsProps {
  /** Liste des passagers à afficher */
  passengers: Passenger[];
  /** Indique si la liste déroulante des passagers est ouverte */
  isOpen: boolean;
  /** Fonction pour basculer l'affichage de la liste déroulante */
  onToggle: () => void;
  /** Fonction pour fermer la liste déroulante */
  onClose: () => void;
}

/**
 * Affiche les avatars des passagers d'un trajet.
 * - Montre au maximum 2 avatars directement.
 * - Si un seul passager, affiche aussi son nom cliquable.
 * - Si plus de 2 passagers, affiche un lien "+X autres" avec une liste déroulante.
 */
function PassengerAvatars({ passengers, isOpen, onToggle, onClose }: PassengerAvatarsProps) {
  const { lang } = useAppState();

  return (
    <div className="relative flex items-center gap-2 mt-2">
      {/* Affichage des 2 premiers avatars avec lien vers le profil public */}
      {passengers.slice(0, 2).map((p) => (
        <Link key={p.id} href={`/public-profile?accountid=${p.id}`}>
          <Image src={p.pictureUrl} alt={p.name} className="w-10 h-10 rounded-full" width={40} height={40} />
        </Link>
      ))}

      {/* Si un seul passager, afficher son nom à côté de l'avatar */}
      {passengers.length === 1 && (
        <Link href={`/public-profile?accountid=${passengers[0].id}`} className="text-sm text-gray-700 hover:text-blue-500 hover:underline">
          {passengers[0].name}
        </Link>
      )}

      {/* Indicateur du nombre de passagers supplémentaires (au-delà de 2) */}
      {passengers.length > 2 && (
        <span className="text-sm text-gray-700 hover:text-blue-400 hover:underline cursor-pointer" onClick={onToggle}>
          +{passengers.length - 2} {lang === Language.FR ? "autres" : "more"}
        </span>
      )}

      {/* Liste déroulante affichant tous les passagers au survol */}
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

// ─── Sous-composant : carte d'un trajet recommandé ──────────────────────────

/** Props pour la carte d'un trajet individuel */
interface TripCardProps {
  /** Données du trajet à afficher */
  trip: Trip;
  /** Indique si la liste des passagers est ouverte pour cette carte */
  isPassengerListOpen: boolean;
  /** Fonction pour basculer la visibilité de la liste des passagers */
  onTogglePassengerList: () => void;
  /** Fonction pour fermer la liste des passagers */
  onClosePassengerList: () => void;
}

/**
 * Carte représentant un trajet recommandé pour un passager.
 *
 * Affiche les informations suivantes :
 * - Photo de profil du conducteur
 * - Date et heure du trajet
 * - Nom du conducteur avec lien vers son profil et sa note
 * - Points de départ et d'arrivée
 * - Avatars des passagers inscrits et nombre de places
 * - Prix du trajet en CAD
 * - Bouton de réservation qui redirige vers la page du trajet
 *
 * Le composant est entièrement localisé (français / anglais) via `useAppState`.
 * Des animations de survol et de clic sont appliquées pour un retour visuel interactif.
 */
function TripCard({ trip, isPassengerListOpen, onTogglePassengerList, onClosePassengerList }: TripCardProps) {
  const { lang } = useAppState();
  const router   = useRouter();

  return (
    <div className="w-full flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-xl bg-gray-100 p-4 mb-4 hover:shadow-2xl hover:scale-105 transition-all active:scale-95">
      {/* Photo de profil du conducteur */}
      <Image src={trip.driver.pictureUrl} alt={trip.driver.name} className="w-2/11 h-35 rounded-xl object-cover" width={400} height={400} />

      {/* Séparateur vertical entre la photo et les détails */}
      <div className="w-px h-30 bg-black shrink-0" />

      {/* Bloc principal contenant les détails du trajet */}
      <div className="flex flex-col relative items-start w-full">
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex flex-col w-full">
            {/* Date et heure du trajet */}
            <span className="text-xl font-semibold text-black">
              {formatDate(trip.date, lang)} : {trip.time}
            </span>

            {/* Informations sur le conducteur : nom, note et nombre de trajets */}
            <div className="flex items-center text-black text-2xl gap-2">
              {lang === Language.FR ? "Avec :" : "With:"}
              <Link href={`/public-profile?accountid=${trip.driver.id}`} className="text-2xl font-semibold truncate max-w-40 text-blue-500 hover:text-blue-700 hover:underline" title={trip.driver.name}>
                {trip.driver.name}
              </Link>
              <p className="text-yellow-400 text-xl flex gap-1 items-center">
                <FaStar /> {trip.driver.rating}
                <span>({trip.driver.tripsCount} {lang === Language.FR ? "trajets" : "trips"})</span>
              </p>
            </div>

            {/* Points de départ et de destination avec flèche directionnelle */}
            <p className="flex gap-1 text-[#08316e] items-baseline text-2xl">
              <FaLocationDot />
              <span className="truncate max-w-30 text-black font-bold">{trip.departure}</span>
              <FaArrowRight className="scale-x-250 scale-y-90 mx-4 mt-1 h-5" />
              <span className="truncate max-w-30 text-black font-bold">{trip.destination}</span>
            </p>

            {/* Ligne du bas : avatars passagers et compteur de places */}
            <div className="w-full flex justify-between items-center mt-2">
              <PassengerAvatars
                passengers={trip.passengers}
                isOpen={isPassengerListOpen}
                onToggle={onTogglePassengerList}
                onClose={onClosePassengerList}
              />
              {/* Nombre de passagers inscrits par rapport au maximum */}
              <div className="flex items-center text-2xl gap-2">
                <span className="text-gray-700">{trip.passengers.length}/{trip.maxPassengers}</span>
                <FaUserFriends className="text-[#08316e]" />
              </div>
            </div>
          </div>

          {/* Bloc prix du trajet */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <span className="text-black font-bold text-xl underline">{lang === Language.FR ? "Prix" : "Price"}</span>
            <span className="text-xl font-bold text-red-500">{trip.price} CAD</span>
          </div>
        </div>
      </div>

      {/* Bouton de réservation qui redirige vers la page de détails du trajet */}
      <div className="flex flex-col justify-center w-2/11 items-center shrink-0">
        <button
          className="w-full bg-[#08316e] text-white font-bold py-2 px-4 rounded-full text-xl hover:bg-[#06214a] hover:scale-105 active:scale-95 transition-all"
          onClick={() => router.push(`/trip-view/${trip.id}`)}
        >
          <FaPlusCircle className="inline-block mr-2" />
          {lang === Language.FR ? "Réserver" : "Book"}
        </button>
      </div>
    </div>
  );
}

// ─── Section principale : trajets recommandés ───────────────────────────────

/**
 * Section affichant la liste des trajets recommandés pour un passager.
 *
 * Utilise le hook `useRecommendedRides` pour récupérer les trajets,
 * gérer l'état d'ouverture des listes de passagers et détecter si
 * aucun trajet n'est disponible.
 *
 * Affiche un message informatif lorsqu'il n'y a aucun trajet disponible,
 * ou une liste défilable de cartes de trajets dans le cas contraire.
 */
export function RecommendedRidesSection() {
  const { lang } = useAppState();
  const { trips, isEmpty, openPassengerLists, togglePassengerList, closePassengerList } = useRecommendedRides();

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-white text-black">
      {/* En-tête : titre de la section et lien vers toutes les réservations */}
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {lang === Language.FR ? "Trajet(s) Recommandé(s)" : "Recommended Rides"}
        </h2>
        <Link href="/reservations" className="text-lg font-medium text-blue-500 hover:underline hover:text-blue-700">
          {lang === Language.FR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      {/* Séparateur horizontal supérieur */}
      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />

      {/* Contenu principal : message vide ou liste de cartes de trajets */}
      <div className="w-full h-100 container justify-center items-center px-10">
        {isEmpty ? (
          // Message affiché lorsqu'aucun trajet recommandé n'est disponible
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-700 text-2xl text-center">
              {lang === Language.FR ? "Aucun trajet disponible pour le moment." : "No trips available at the moment."}
            </p>
          </div>
        ) : (
          // Liste défilable des cartes de trajets recommandés
          <div className="w-full flex flex-col max-h-100 items-center px-10 overflow-y-auto">
            {trips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isPassengerListOpen={openPassengerLists[index]}
                onTogglePassengerList={() => togglePassengerList(index)}
                onClosePassengerList={() => closePassengerList(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Séparateur horizontal inférieur */}
      <div className="w-13/15 h-1 bg-[#08316e] rounded-full" />
    </section>
  );
}
