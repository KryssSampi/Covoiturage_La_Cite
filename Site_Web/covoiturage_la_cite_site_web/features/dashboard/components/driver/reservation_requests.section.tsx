"use client";

/**
 * @file reservation_requests.section.tsx
 * @description Section "Mes Demandes de Réservation" — exclusif au rôle Conducteur.
 *
 * Affiche les demandes de réservation en attente, triées par :
 * 1. Note de l'applicant décroissante (passagers fiables en premier)
 * 2. Date/heure croissante (créneaux les plus proches d'abord)
 *
 * Chaque carte : photo + note + trajets effectués de l'applicant,
 * détails du trajet (départ → arrivée, date, places, prix),
 * boutons Accepter / Refuser.
 *
 * @uses useReservationRequests — tri et encapsulation en modèles
 * @uses ReservationRequest — type depuis dashboard/types
 * @uses FIXTURE_RESERVATION_REQUESTS — données de test (à remplacer par API)
 */

import Image from "next/image";
import Link from "next/link";
import { FaUserFriends, FaArrowRight, FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";

import { useReservationRequests } from "../../hooks";
import {
  ReservationRequest,
  ReservationRequestCardModel,
} from "../../types";
import { FIXTURE_RESERVATION_REQUESTS } from "@/tests/fixtures/dashboard/reservationrequest.fixtures";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * ReservationRequestsSection
 *
 * @param requests Liste des demandes de réservation en attente.
 *   Par défaut : FIXTURE_RESERVATION_REQUESTS.
 *   TODO: Brancher sur GET /api/driver/{userId}/reservation-requests?status=pending
 *   TODO: Brancher POST /api/reservation-requests/{id}/accept (bouton Accepter)
 *   TODO: Brancher POST /api/reservation-requests/{id}/decline (bouton Refuser)
 */
export function ReservationRequestsSection({
  requests = FIXTURE_RESERVATION_REQUESTS,
}: {
  requests?: ReservationRequest[];
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const { requestModels, isPassengerListOpens, setIsPassengerListOpens } =
    useReservationRequests(requests);

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-[#08316ee5] text-white">
      {/* ─── En-tête ──────────────────────────────────────────────────── */}
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {isFR ? "Mes Demandes de Réservation" : "My Reservation Requests"}
        </h2>
        <Link
          href="/driver/reservations"
          className="text-lg font-medium text-blue-400 hover:underline hover:text-blue-300"
        >
          {isFR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      <div className="w-13/15 h-1 bg-white rounded-full" />

      {/* ─── Liste ou état vide ───────────────────────────────────────── */}
      <div className="w-full h-100 container justify-center items-center px-10">
        {requestModels.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-white text-2xl text-center">
              {isFR ? "Aucune demande de réservation pour le moment." : "No reservation requests at the moment."}
            </p>
          </div>
        ) : (
          <div
            className="w-full flex flex-col max-h-100 items-center px-10 overflow-y-auto"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {requestModels.map((model) => (
              <ReservationRequestCard
                key={model.request.id}
                model={model}
                isPassengerListOpens={isPassengerListOpens}
                setIsPassengerListOpens={setIsPassengerListOpens}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-13/15 h-1 bg-white rounded-full" />
    </section>
  );
}

// ─── Carte de demande ────────────────────────────────────────────────────────

/**
 * ReservationRequestCard
 * Affiche les détails d'une demande de réservation avec actions Accepter / Refuser.
 * Les images Unsplash (départ / arrivée) sont chargées en parallèle au montage.
 *
 * TODO: onClick Accepter → POST /api/reservation-requests/{id}/accept
 * TODO: onClick Refuser  → POST /api/reservation-requests/{id}/decline
 */
function ReservationRequestCard({
  model,
}: {
  model: ReservationRequestCardModel;
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  setIsPassengerListOpens: React.Dispatch<
    React.SetStateAction<{ isPassengerListOpen: boolean }[]>
  >;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { request } = model;



  return (
    <div className="w-full h-fit flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-2xs border border-gray-300 shadow-white bg-gray-200 p-4 mb-4 hover:shadow-xl hover:scale-[1.02] transition-all">

      {/* ─── Photo de profil de l'applicant ──────────────────────────── */}
      <Image
        src={request.applicant.urlPicture}
        alt={`${request.applicant.name} profile picture`}
        className="w-2/11 h-35 rounded-xl"
        width={400}
        height={400}
      />

      <div className="w-px h-40 bg-black" />

      {/* ─── Informations applicant + trajet ─────────────────────────── */}
      <div className="flex flex-col relative items-start justify-center gap-y-1 h-full w-full">

        {/* Nom + note + trajets effectués */}
        <div className="flex items-center text-black text-2xl gap-x-2">
          <Link
            href={`/public-profile?accountid=${request.applicant.id}`}
            className="text-2xl font-semibold text-blue-500 hover:text-blue-700 hover:underline"
          >
            {request.applicant.name}
          </Link>
          <p className="text-yellow-400 text-xl flex gap-1 items-center">
            <FaStar />
            {request.applicant.note}
            <span>
              ({request.applicant.doneTrips} {isFR ? "trajets" : "trips"})
            </span>
          </p>
        </div>

        {/* Résumé du trajet demandé */}
        <p className="flex gap-1 text-[#08316e] items-baseline font-semibold text-2xl">
          {isFR ? "Veut rejoindre votre trajet de" : "Wants to join your ride from"} :
        </p>

        <div className="w-full justify-between flex items-center">
          <p className="flex gap-1 text-[#08316e] items-baseline font-semibold text-2xl">
            <FaLocationDot />
            <span className="truncate max-w-30 text-black font-bold">{request.departure}</span>
            <FaArrowRight className="scale-x-250 scale-y-90 mx-4 mt-1 h-5" />
            <span className="truncate max-w-30 text-black font-bold">{request.destination}</span>
            {", "}
            <span className="flex items-center text-2xl gap-2">
              <span className="text-gray-700">
                {request.currentPassengers}/{request.maxPassengers}
              </span>
              <FaUserFriends className="text-[#08316e]" />
            </span>
          </p>
        </div>

        {/* Date, heure, prix */}
        <div className="w-full text-black justify-between flex items-center">
          <span className="text-xl font-semibold text-black">
            {isFR ? "De : " : "Of : "}
            {formatDate(request.date, appState.lang)} : {request.time}
          </span>
          <div className="w-fit flex gap-2 items-center">
            <span className="text-black font-bold text-xl">{isFR ? "Frais" : "Fee"} :</span>
            <span className="text-xl font-bold text-green-500">{request.price} CAD</span>
          </div>
        </div>
      </div>

      {/* ─── Actions Accepter / Refuser ───────────────────────────────── */}
      <div className="flex flex-col h-full justify-between w-3/11 gap-y-10 items-center">
        <button
          className="w-full bg-green-600 hover:bg-green-800 hover:shadow text-gray-300
                     font-bold py-1 text-2xl px-4 rounded-xl transition-colors"
          onClick={() => {
            // TODO: POST /api/reservation-requests/{request.id}/accept
          }}
        >
          {isFR ? "Accepter" : "Accept"}
        </button>
        <button
          className="w-full bg-red-600 hover:bg-red-800 hover:shadow text-gray-300
                     font-bold py-1 text-2xl px-4 rounded-xl transition-colors"
          onClick={() => {
            // TODO: POST /api/reservation-requests/{request.id}/decline
          }}
        >
          {isFR ? "Refuser" : "Decline"}
        </button>
      </div>
    </div>
  );
}
