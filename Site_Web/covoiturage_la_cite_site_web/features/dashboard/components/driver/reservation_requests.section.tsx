"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserFriends, FaArrowRight, FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import type {
  ReservationRequest,
  ReservationRequestCardModel,
} from "../../types";
import {
  ReservationDecisionToast,
  type DecisionType,
  type DecisionDetails,
} from "@/shared/components/ReservationDecisionToast";
import { FIXTURE_RESERVATION_REQUESTS } from "@/tests/fixtures/dashboard/reservationrequest.fixtures";

const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

function organizeRequests(requests: ReservationRequest[]): ReservationRequest[] {
  return [...requests].sort((a, b) => {
    const noteDiff = b.applicant.note - a.applicant.note;
    if (noteDiff !== 0) return noteDiff;
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });
}

export function ReservationRequestsSection({
  requests,
  onAcceptRequest,
  onRejectRequest,
  isActionLoading = false,
}: {
  requests?: ReservationRequest[];
  onAcceptRequest?: (id: string) => Promise<boolean>;
  onRejectRequest?: (id: string) => Promise<boolean>;
  isActionLoading?: boolean;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Données visibles — dérivées directement des props
  const visibleRequests = requests ?? FIXTURE_RESERVATION_REQUESTS;
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const requestModels = useMemo<ReservationRequestCardModel[]>(
    () =>
      organizeRequests(visibleRequests)
        .filter((r) => !removedIds.has(String(r.id)))
        .map((request) => ({
          request,
          isPassengerListOpen: false,
        })),
    [visibleRequests, removedIds]
  );

  const [toastOpen, setToastOpen] = useState(false);
  const [toastDecision, setToastDecision] = useState<DecisionType>("accept");
  const [toastDetails, setToastDetails] = useState<DecisionDetails>({
    applicantName: "",
    departure: "",
    destination: "",
    date: "",
    time: "",
  });
  const [toastTargetId, setToastTargetId] = useState<string>("");

  const openDecisionToast = (
    id: string,
    decision: DecisionType,
    request: ReservationRequest,
  ) => {
    setToastTargetId(id);
    setToastDecision(decision);
    setToastDetails({
      applicantName: request.applicant.name,
      departure: request.departure,
      destination: request.destination,
      date: request.date,
      time: request.time,
    });
    setToastOpen(true);
  };

  const handleConfirmDecision = async () => {
    setToastOpen(false);

    if (toastDecision === "accept") {
      const ok = await (onAcceptRequest?.(toastTargetId) ?? Promise.resolve(true));
      if (ok) {
        setRemovedIds((prev) => new Set(prev).add(toastTargetId));
      }
    } else {
      const ok = await (onRejectRequest?.(toastTargetId) ?? Promise.resolve(true));
      if (ok) {
        setRemovedIds((prev) => new Set(prev).add(toastTargetId));
      }
    }
  };

  return (
    <section className="w-full py-10 mx-auto flex flex-col justify-center items-center rounded-lg shadow-md bg-[#08316ee5] text-white">
      <div className="w-full flex justify-between mx-auto items-center px-10">
        <h2 className="text-3xl font-bold">
          {isFR ? "Mes Demandes de Reservation" : "My Reservation Requests"}
        </h2>
        <Link
          href="/driver/reservations"
          className="text-lg font-medium text-blue-400 hover:underline hover:text-blue-300"
        >
          {isFR ? "Voir tous" : "See all"} {">"}
        </Link>
      </div>

      <div className="w-13/15 h-1 bg-white rounded-full" />

      <div className="w-full h-100 flex flex-col justify-center items-center px-10">
        {requestModels.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-white text-2xl text-center">
              {isFR ? "Aucune demande de reservation pour le moment." : "No reservation requests at the moment."}
            </p>
          </div>
        ) : (
          <div
            className="w-full flex flex-col max-h-100 items-center px-10 overflow-y-auto"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {requestModels.map((model) => (
              <ReservationRequestCard
                key={String(model.request.id)}
                model={model}
                onAccept={(id) => openDecisionToast(id, "accept", model.request)}
                onReject={(id) => openDecisionToast(id, "reject", model.request)}
                isActionLoading={isActionLoading}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-13/15 h-1 bg-white rounded-full" />

      <ReservationDecisionToast
        isOpen={toastOpen}
        decision={toastDecision}
        details={toastDetails}
        onConfirm={handleConfirmDecision}
        onCancel={() => setToastOpen(false)}
      />
    </section>
  );
}

function ReservationRequestCard({
  model,
  onAccept,
  onReject,
  isActionLoading,
}: {
  model: ReservationRequestCardModel;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isActionLoading: boolean;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { request } = model;

  return (
    <div className="w-full h-fit flex flex-row justify-between items-center gap-x-4 rounded-xl shadow-2xs border border-gray-300 shadow-white bg-gray-200 p-4 mb-4 hover:shadow-xl hover:scale-[1.02] transition-all">
      <Image
        src={request.applicant.urlPicture || AVATAR_FALLBACK}
        alt={`${request.applicant.name} profile picture`}
        className="w-2/11 h-35 rounded-xl"
        width={400}
        height={400}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
      />

      <div className="w-px h-40 bg-black" />

      <div className="flex flex-col relative items-start justify-center gap-y-1 h-full w-full">
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

      <div className="flex flex-col h-full justify-between w-3/11 gap-y-10 items-center">
        <button
          className="w-full bg-green-600 hover:bg-green-800 hover:shadow text-gray-300 font-bold py-1 text-2xl px-4 rounded-xl transition-colors disabled:opacity-50"
          onClick={() => onAccept(String(request.id))}
          disabled={isActionLoading}
        >
          {isFR ? "Accepter" : "Accept"}
        </button>
        <button
          className="w-full bg-red-600 hover:bg-red-800 hover:shadow text-gray-300 font-bold py-1 text-2xl px-4 rounded-xl transition-colors disabled:opacity-50"
          onClick={() => onReject(String(request.id))}
          disabled={isActionLoading}
        >
          {isFR ? "Refuser" : "Decline"}
        </button>
      </div>
    </div>
  );
}
