"use client";

/**
 * Page de listing des demandes de réservation du conducteur.
 * Utilise ListDetailPage avec le hook useDriverReservationRequestsList.
 * Le panneau détail affiche une page de profil (esquisse) du demandeur
 * avec les détails du trajet et les boutons accepter/refuser.
 */

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaUserFriends, FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";
import {
  FaLocationDot,
  FaShieldHalved,
  FaCalendarDays,
  FaClock,
  FaDollarSign,
  FaRoute,
  FaCircleCheck,
  FaIdCard,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { ReservationRequest } from "@/features/dashboard/types";
import { useDriverReservationRequestsConfig } from "../hooks/useDriverReservationRequestsList";

// ─── Props du composant (données et handlers fournis par la page route) ──────

interface DriverReservationsPageProps {
  items: ReservationRequest[];
  onAcceptRequest: (id: string) => Promise<boolean>;
  onRejectRequest: (id: string) => Promise<boolean>;
  isActionLoading?: boolean;
}

// ─── Constante de fallback pour les photos de profil ─────────────────────────
const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// ─── Carte de demande pour le listing ────────────────────────────────────────

function ReservationRequestListCard({
  request,
  lang,
}: {
  request: ReservationRequest;
  lang: Language;
}) {
  const isFR = lang === Language.FR;

  return (
    <div className="flex items-center gap-3 p-3">
      {/* Photo de l'applicant */}
      <Image
        src={request.applicant.urlPicture || AVATAR_FALLBACK}
        alt={request.applicant.name}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
        width={48}
        height={48}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
      />

      {/* Infos */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/public-profile?accountid=${request.applicant.id}`}
            className="font-semibold text-blue-500 hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {request.applicant.name}
          </Link>
          <FaStar className="text-yellow-400 shrink-0" size={10} />
          <span className="text-xs text-gray-600">
            {request.applicant.note} ({request.applicant.doneTrips} {isFR ? "trajets" : "trips"})
          </span>
        </div>

        <p className="flex items-center gap-1 text-xs text-[#08316e] mt-0.5">
          <FaLocationDot size={10} />
          <span className="truncate max-w-20">{request.departure}</span>
          <FaArrowRight size={8} />
          <span className="truncate max-w-20">{request.destination}</span>
        </p>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600">
            {formatDate(request.date, lang)} — {request.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            {request.currentPassengers}/{request.maxPassengers}
            <FaUserFriends size={12} className="text-[#08316e]" />
          </span>
        </div>
      </div>

      {/* Prix */}
      <span className="text-sm font-bold text-green-500 shrink-0">
        {request.price} CAD
      </span>
    </div>
  );
}

// ─── Fake Profile Page (esquisse) — panneau détail conducteur ─────────────────

function FakeProfileDetail({
  request,
  lang,
  onAccept,
  onReject,
}: {
  request: ReservationRequest;
  lang: Language;
  onAccept: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}) {
  const isFR = lang === Language.FR;
  const { applicant } = request;
  const [isPending, setIsPending] = useState<'accept' | 'refuse' | null>(null);

  return (
    <div className="flex flex-col min-h-full bg-[#f0f4f8]">
      {/* En-tête profil */}
      <div className="bg-[#08316e] px-5 pt-6 pb-10 text-center">
        <div className="w-20 h-20 rounded-full border-3 border-white overflow-hidden mx-auto mb-3">
          <Image
            src={applicant.urlPicture || AVATAR_FALLBACK}
            alt={applicant.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
          />
        </div>
        <h2 className="text-white text-base font-bold">{applicant.name}</h2>
        <div className="flex items-center justify-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar
              key={i}
              size={12}
              color={i <= Math.round(applicant.note) ? "#f59e0b" : "#6b7280"}
            />
          ))}
          <span className="text-white/80 text-xs ml-1">{applicant.note}</span>
        </div>
        <p className="text-white/60 text-xs mt-1">
          {applicant.doneTrips} {isFR ? "trajets effectués" : "trips completed"}
        </p>
      </div>

      {/* Badges de vérification (fictifs) */}
      <div className="bg-white mx-4 -mt-5 rounded-xl shadow-sm p-4">
        <h3 className="text-xs font-bold text-[#08316e] mb-2 flex items-center gap-1.5">
          <FaShieldHalved size={12} />
          {isFR ? "Vérifications" : "Verifications"}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaCircleCheck size={11} color="#16a34a" />
            {isFR ? "Identité vérifiée" : "Identity verified"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaIdCard size={11} color="#08316e" />
            {isFR ? "Étudiant La Cité" : "La Cité student"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaEnvelope size={11} color="#08316e" />
            {isFR ? "Email confirmé" : "Email confirmed"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaPhone size={11} color="#08316e" />
            {isFR ? "Téléphone vérifié" : "Phone verified"}
          </div>
        </div>
      </div>

      {/* Bio fictive */}
      <div className="bg-white mx-4 mt-3 rounded-xl shadow-sm p-4">
        <h3 className="text-xs font-bold text-[#08316e] mb-1">Bio</h3>
        <p className="text-xs text-gray-500 italic">
          {isFR
            ? "Cet utilisateur n'a pas encore ajouté de bio."
            : "This user hasn't added a bio yet."}
        </p>
      </div>

      {/* Détails du trajet demandé */}
      <div className="bg-white mx-4 mt-3 rounded-xl shadow-sm p-4">
        <h3 className="text-xs font-bold text-[#08316e] mb-3 flex items-center gap-1.5">
          <FaRoute size={12} />
          {isFR ? "Trajet demandé" : "Requested trip"}
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <FaLocationDot size={11} color="#08316e" />
            <span className="text-gray-500 w-16 shrink-0">{isFR ? "Départ" : "From"}</span>
            <span className="font-medium text-gray-800 truncate">{request.departure}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaLocationDot size={11} color="#e04a2f" />
            <span className="text-gray-500 w-16 shrink-0">{isFR ? "Arrivée" : "To"}</span>
            <span className="font-medium text-gray-800 truncate">{request.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaCalendarDays size={11} color="#08316e" />
            <span className="text-gray-500 w-16 shrink-0">Date</span>
            <span className="font-medium text-gray-800">{formatDate(request.date, lang)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaClock size={11} color="#08316e" />
            <span className="text-gray-500 w-16 shrink-0">{isFR ? "Heure" : "Time"}</span>
            <span className="font-medium text-gray-800">{request.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaUserFriends size={11} color="#08316e" />
            <span className="text-gray-500 w-16 shrink-0">Places</span>
            <span className="font-medium text-gray-800">
              {request.currentPassengers}/{request.maxPassengers}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <FaDollarSign size={11} color="#08316e" />
            <span className="text-gray-500 w-16 shrink-0">{isFR ? "Prix" : "Price"}</span>
            <span className="font-bold text-green-600">{request.price} CAD</span>
          </div>
        </div>
      </div>

      {/* Boutons accepter / refuser */}
      <div className="mx-4 mt-4 mb-6 flex gap-3">
        <button
          disabled={isPending !== null}
          className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: "#16a34a" }}
          onClick={async () => {
            setIsPending('accept');
            try { await onAccept(request.id); }
            finally { setIsPending(null); }
          }}
        >
          <FaCheck size={12} />
          {isPending === 'accept' ? '...' : (isFR ? "Accepter" : "Accept")}
        </button>
        <button
          disabled={isPending !== null}
          className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: "#dc2626" }}
          onClick={async () => {
            setIsPending('refuse');
            try { await onReject(request.id); }
            finally { setIsPending(null); }
          }}
        >
          <FaTimes size={12} />
          {isPending === 'refuse' ? '...' : (isFR ? "Refuser" : "Refuse")}
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function DriverReservationsPage({
  items,
  onAcceptRequest,
  onRejectRequest,
}: DriverReservationsPageProps) {
  const { lang } = useAppState();
  const { sortOptions, searchKeys, emptyMessage } = useDriverReservationRequestsConfig();

  // Rendu de la carte de demande dans le listing
  const renderCard = useCallback(
    (request: ReservationRequest) => (
      <ReservationRequestListCard request={request} lang={lang} />
    ),
    [lang],
  );

  // Rendu détail : fake profile page avec détails trajet + boutons accepter/refuser
  const renderDetail = useCallback(
    (request: ReservationRequest) => (
      <FakeProfileDetail
        request={request}
        lang={lang}
        onAccept={onAcceptRequest}
        onReject={onRejectRequest}
      />
    ),
    [lang, onAcceptRequest, onRejectRequest],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      renderDetail={renderDetail}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      withOverview={true}
      emptyMessage={emptyMessage}
      itemParamKey="demandeid"
    />
  );
}
