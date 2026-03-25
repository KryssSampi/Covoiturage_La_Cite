'use client';

import React, { useState } from 'react';
import { PublishedTripViewData, ViewerRole, ReservationStatus, TripViewSource } from '../../types/published-trip.view.types';
import { usePublishedTripView } from '../../hooks/usePublishedTripView';
import { TripMapArea, TripSummaryCard, TripPointSection, TripPreferencesSection, TripStatusSection } from './sections';
import { MapOverlay, ReservationConfirmModal } from './ui';
import { CancelConfirmToast } from '@/shared/components/CancelConfirmToast';
import { ReservationRequestToast } from '@/shared/components/ReservationRequestToast';
import { Language, useAppState } from '@/core/state/app_state';

// Polyline placeholder — ligne droite entre départ et arrivée quand pas de données OSRM
function getPlaceholderPolyline(
  depLat?: number, depLng?: number,
  arrLat?: number, arrLng?: number,
): [number, number][] {
  if (depLat == null || depLng == null || arrLat == null || arrLng == null) return [];
  // Génère 5 points interpolés entre départ et arrivée pour simuler un tracé
  const steps = 5;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([
      depLat + (arrLat - depLat) * t,
      depLng + (arrLng - depLng) * t,
    ]);
  }
  return points;
}

interface PublishedTripViewProps {
  trip: PublishedTripViewData;
  viewerRole: ViewerRole;
  existingReservation?: {
    status: ReservationStatus;
    updatedAt: string;
  };
  /** Source de navigation — d'où l'utilisateur vient (reservation ou publishedtrip) */
  source?: TripViewSource;
  /** Statut de la carte source (ex: "confirmed", "published") */
  sourceStatus?: string;
}

export const PublishedTripView: React.FC<PublishedTripViewProps> = ({
  trip,
  viewerRole,
  existingReservation,
  source,
  sourceStatus,
}) => {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  const {
    buttonState,
    isMapOverlayOpen,
    overlayMode,
    isConfirmModalOpen,
    isSubmitting,
    reservationToast,
    openConfirmModal,
    closeConfirmModal,
    confirmReservation,
    handleReservationToastOk,
    openMapOverlay,
    openMapOverlayDeparture,
    openMapOverlayArrival,
    closeMapOverlay,
  } = usePublishedTripView({ trip, viewerRole, existingReservation, source, sourceStatus });

  // État du toast de confirmation d'annulation
  const [showCancelToast, setShowCancelToast] = useState(false);

  // Annulation (mock — à brancher sur l'API)
  const handleCancelConfirm = () => {
    // TODO: PATCH /api/{reservations|trips}/{id} { status: "cancelled" }
    setShowCancelToast(false);
  };

  // Polyline : utilise les données ou un placeholder si absentes
  const effectiveLatLngs = trip.latLngs && trip.latLngs.length > 0
    ? trip.latLngs
    : getPlaceholderPolyline(
        trip.departure.lat, trip.departure.lng,
        trip.arrival.lat, trip.arrival.lng,
      );

  // Coordonnées [lat, lng] du départ et de l'arrivée pour l'overlay single-point
  const departurePoint: [number, number] | undefined =
    typeof trip.departure.lat === 'number' && typeof trip.departure.lng === 'number'
      ? [trip.departure.lat, trip.departure.lng]
      : undefined;
  const arrivalPoint: [number, number] | undefined =
    typeof trip.arrival.lat === 'number' && typeof trip.arrival.lng === 'number'
      ? [trip.arrival.lat, trip.arrival.lng]
      : undefined;

  // Détermine si le bouton annuler doit être affiché (masqué si annulé ou terminé)
  const hiddenStatuses = ['cancelled', 'completed'];
  const showCancelButton = source != null && !hiddenStatuses.includes(sourceStatus ?? '');

  // Label du toast d'annulation adapté à la source
  const cancelLabel = source === 'reservation'
    ? (isFR ? 'cette réservation' : 'this reservation')
    : (isFR ? 'ce trajet' : 'this trip');

  return (
    <>
      {/* Page principale */}
      <div className="min-h-screen pb-10" style={{ background: '#f0f4f8' }}>

        {/* 1. Zone carte (haut, pleine largeur) */}
        <TripMapArea
          departureLabel={trip.departure.label}
          arrivalLabel={trip.arrival.label}
          durationMin={trip.estimatedDuration}
          distanceKm={trip.estimatedDistance}
          latLngs={effectiveLatLngs}
          onMapClick={openMapOverlay}
        />

        {/* 2. Carte résumé (chevauche le bas de la carte) */}
        <TripSummaryCard
          trip={trip}
          buttonState={buttonState}
          onReserveClick={openConfirmModal}
          showCancelButton={showCancelButton}
          onCancelClick={() => setShowCancelToast(true)}
        />

        {/* 3. Sections détails */}
        <div className="px-4 mt-5 flex flex-col gap-3">

          <h2 className="text-sm font-bold" style={{ color: '#08316e' }}>
            Détails du trajet
          </h2>

          {/* Grille départ / arrivée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TripPointSection
              type="departure"
              point={trip.departure}
              onMapClick={openMapOverlayDeparture}
            />
            <TripPointSection
              type="arrival"
              point={trip.arrival}
              onMapClick={openMapOverlayArrival}
            />
          </div>

          {/* Préférences + Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TripPreferencesSection preferences={trip.preferences} />
            <TripStatusSection
              status={trip.status}
              paymentMethod={trip.paymentMethod}
              availableSeats={trip.availableSeats}
              totalSeats={trip.totalSeats}
            />
          </div>
        </div>
      </div>

      {/* Overlay carte plein écran */}
      <MapOverlay
        isOpen={isMapOverlayOpen}
        onClose={closeMapOverlay}
        mode={overlayMode}
        departureLabel={trip.departure.label}
        arrivalLabel={trip.arrival.label}
        latLngs={effectiveLatLngs}
        departurePoint={departurePoint}
        arrivalPoint={arrivalPoint}
        departureFullAddress={trip.departure.fullAddress}
        arrivalFullAddress={trip.arrival.fullAddress}
      />

      {/* Modal confirmation réservation */}
      <ReservationConfirmModal
        isOpen={isConfirmModalOpen}
        isSubmitting={isSubmitting}
        trip={trip}
        onConfirm={confirmReservation}
        onCancel={closeConfirmModal}
      />

      {/* Toast de confirmation d'annulation */}
      <CancelConfirmToast
        isOpen={showCancelToast}
        label={cancelLabel}
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelToast(false)}
      />

      {/* Toast après envoi d'une demande de réservation */}
      <ReservationRequestToast
        isOpen={reservationToast.isOpen}
        success={reservationToast.success}
        message={reservationToast.message}
        onOk={handleReservationToastOk}
      />
    </>
  );
};
