'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { ReserveButtonState } from '../../../types/published-trip.view.types';

interface ReserveButtonProps {
  state: ReserveButtonState;
  tripId: string;
  onReserveClick: () => void;
}

export const ReserveButton: React.FC<ReserveButtonProps> = ({
  state,
  tripId,
  onReserveClick,
}) => {
  const router = useRouter();

  const baseClass =
    'w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200';

  switch (state.kind) {
    // ── États par défaut (accès direct) ─────────────────────────
    case 'reserve':
      return (
        <button
          onClick={onReserveClick}
          className={`${baseClass} text-white hover:opacity-90 active:scale-95`}
          style={{ backgroundColor: '#08316e' }}
        >
          Réserver ce trajet
        </button>
      );

    case 'pending':
      return (
        <button
          disabled
          className={`${baseClass} text-white opacity-60 cursor-not-allowed`}
          style={{ backgroundColor: '#08316e' }}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            En attente de confirmation…
          </span>
        </button>
      );

    case 'confirmed':
      return (
        <button
          onClick={() => router.push(`/trajets/${tripId}`)}
          className={`${baseClass} text-white hover:opacity-90 active:scale-95`}
          style={{ backgroundColor: '#1a6b3a' }}
        >
          <span className="flex items-center justify-center gap-2">
            <FaCircleCheck size={14} /> Suivre le trajet
          </span>
        </button>
      );

    case 'cooldown':
      return (
        <div className="flex flex-col gap-1">
          <button
            disabled
            className={`${baseClass} bg-gray-200 text-gray-500 cursor-not-allowed`}
          >
            <span className="flex items-center justify-center gap-2">
              <FaCircleXmark size={14} /> Demande refusée
            </span>
          </button>
          <p className="text-center text-xs text-gray-400">
            Vous pourrez retenter dans{' '}
            <span className="font-semibold text-gray-500">
              {Math.ceil(state.hoursLeft)}h
            </span>
          </p>
        </div>
      );

    case 'full':
      return (
        <button
          disabled
          className={`${baseClass} bg-gray-200 text-gray-500 cursor-not-allowed`}
        >
          Trajet complet
        </button>
      );

    case 'manage':
      return (
        <button
          onClick={() => router.push(`/driver/reservations/${tripId}`)}
          className={`${baseClass} text-white hover:opacity-90 active:scale-95`}
          style={{ backgroundColor: '#08316e' }}
        >
          Gérer les demandes
        </button>
      );

    case 'readonly':
      return null;

    // ── États contextuels — arrivée depuis ReservationCard ──────
    case 'reservation-confirmed':
      return (
        <button
          disabled
          className={`${baseClass} text-white opacity-60 cursor-not-allowed`}
          style={{ backgroundColor: '#1a6b3a' }}
        >
          <span className="flex items-center justify-center gap-2">
            <FaCircleCheck size={14} /> Confirmé
          </span>
        </button>
      );

    case 'reservation-inprogress':
      return (
        <button
          onClick={() => router.push(`/map?reservationId=${tripId}`)}
          className={`${baseClass} text-white hover:opacity-90 active:scale-95`}
          style={{ backgroundColor: '#08316e' }}
        >
          Suivre le trajet
        </button>
      );

    case 'reservation-cancelled':
      return (
        <button
          disabled
          className={`${baseClass} bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed`}
        >
          Annulé
        </button>
      );

    case 'reservation-pending':
      return (
        <button
          disabled
          className={`${baseClass} bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed`}
        >
          En attente
        </button>
      );

    case 'reservation-completed':
      return (
        <button
          disabled
          className={`${baseClass} bg-transparent text-gray-400 border-none cursor-default`}
        >
          Complété
        </button>
      );

    case 'reservation-rejected':
      return (
        <button
          disabled
          className={`${baseClass} bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed`}
        >
          <span className="flex items-center justify-center gap-2">
            <FaCircleXmark size={14} /> Rejeté
          </span>
        </button>
      );

    // ── États contextuels — arrivée depuis PublishedTripCard ────
    case 'trip-published':
      return (
        <button
          disabled
          className={`${baseClass} bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed`}
        >
          Publié
        </button>
      );

    case 'trip-full':
      return (
        <button
          disabled
          className={`${baseClass} bg-white border border-gray-200 text-green-500 cursor-not-allowed`}
        >
          Plein
        </button>
      );

    case 'trip-confirmed':
      return (
        <button
          disabled
          className={`${baseClass} text-white opacity-60 cursor-not-allowed`}
          style={{ backgroundColor: '#1a6b3a' }}
        >
          <span className="flex items-center justify-center gap-2">
            <FaCircleCheck size={14} /> Confirmé
          </span>
        </button>
      );

    case 'trip-inprogress':
      return (
        <button
          onClick={() => router.push(`/map?reservationId=${tripId}`)}
          className={`${baseClass} text-white hover:opacity-90 active:scale-95`}
          style={{ backgroundColor: '#08316e' }}
        >
          Suivre le trajet
        </button>
      );

    case 'trip-completed':
      return (
        <button
          disabled
          className={`${baseClass} bg-transparent text-gray-400 border-none cursor-default`}
        >
          Terminé
        </button>
      );

    case 'trip-cancelled':
      return (
        <button
          disabled
          className={`${baseClass} bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed`}
        >
          Annulé
        </button>
      );

    case 'trip-noshow':
      return (
        <button
          disabled
          className={`${baseClass} bg-red-100 text-red-500 opacity-70 cursor-not-allowed`}
        >
          Absent
        </button>
      );

    case 'trip-imminent':
    case 'reservation-imminent':
      return (
        <button
          onClick={() => router.push(`/trajet-en-cours/${tripId}`)}
          className={`${baseClass} text-white hover:opacity-90 active:scale-95 animate-pulse`}
          style={{ backgroundColor: '#0aad6a' }}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            Démarrer le trajet
          </span>
        </button>
      );

    default:
      return null;
  }
};
