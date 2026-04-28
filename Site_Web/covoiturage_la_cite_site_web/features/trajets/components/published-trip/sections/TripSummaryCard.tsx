'use client';
// ══════════════════════════════════════════════════════════════════════
// TripSummaryCard — Wrapper du composant partagé TripHeaderCard
// Mappe les données PublishedTripViewData vers les props du composant.
// ══════════════════════════════════════════════════════════════════════
import React from 'react';
import { FaBan } from 'react-icons/fa6';
import { PublishedTripViewData, ReserveButtonState, ViewerRole } from '../../../types/published-trip.view.types';
import { ReserveButton } from '../ui/ReserveButton';
import { TripHeaderCard } from '@/shared/components/trip-header-card/TripHeaderCard';
import { utcToLocalDateIso, utcToLocalTime } from '@/core/utils/date.utils';
import { Language, useAppState } from '@/core/state/app_state';

interface TripSummaryCardProps {
  trip: PublishedTripViewData;
  viewerRole: ViewerRole;
  buttonState: ReserveButtonState;
  onReserveClick: () => void;
  /** Affiche le bouton annuler à côté du bouton principal */
  showCancelButton?: boolean;
  /** Callback au clic sur le bouton annuler */
  onCancelClick?: () => void;
  /** Libellé utilisé dans le bouton annuler */
  cancelLabel?: string;
}

export const TripSummaryCard: React.FC<TripSummaryCardProps> = ({
  trip,
  viewerRole,
  buttonState,
  onReserveClick,
  showCancelButton,
  onCancelClick,
  cancelLabel,
}) => {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const roleLabel = viewerRole === 'driver_owner'
    ? (isFR ? 'Vue conducteur' : 'Driver view')
    : viewerRole === 'admin'
      ? (isFR ? 'Admin' : 'Admin')
      : (isFR ? 'Vue passager' : 'Passenger view');

  const localDate = utcToLocalDateIso(trip.departureDate, trip.departureTime);
  const localTime = utcToLocalTime(trip.departureDate, trip.departureTime);

  return (
    <TripHeaderCard
      title={`${trip.departure.label} → ${trip.arrival.label}`}
      driver={{
        firstName: trip.driver.firstName,
        avatarUrl: trip.driver.avatarUrl,
        rating: trip.driver.rating,
        tripCount: trip.driver.tripCount,
      }}
      vehicle={{
        label: trip.vehicle.label,
        color: trip.vehicle.color,
        imageUrl: trip.vehicle.imageUrl,
      }}
      price={viewerRole === 'passenger' ? trip.passengerPrice : trip.pricePerPassenger}
      departureDate={localDate}
      departureTime={localTime}
      availableSeats={trip.availableSeats}
      roleLabel={roleLabel}
      className="mx-4 -mt-6 relative z-10"
      actions={
        <>
          <div className="flex-1">
            <ReserveButton
              state={buttonState}
              tripId={trip.id}
              onReserveClick={onReserveClick}
            />
          </div>
          {showCancelButton && (
            <button
              onClick={onCancelClick}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 border-red-400 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-95"
            >
              <FaBan size={14} />
              {cancelLabel ?? (isFR ? 'Annuler' : 'Cancel')}
            </button>
          )}
        </>
      }
    />
  );
};
