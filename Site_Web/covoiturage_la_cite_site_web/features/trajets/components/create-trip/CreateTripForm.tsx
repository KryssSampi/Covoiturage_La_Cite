'use client';

import React, { useState, useEffect } from 'react';
import { useCreateTrip } from '../../hooks';
import { TripWayPrefill } from '../../types';
import type { MockVehicle } from '../../constants/trip.constants';
import {
  BasicInfoSection,
  VehicleSection,
  PricingLeftSection,
  PricingRightSection,
  MapPreviewSection,
} from './sections';
import { useAppState } from '@/core/state/app_state';
import { getProposals } from '@/core/services/location.suggestion';
import { fetchRoute } from '@/features/search/services/osrm.service';
import { ReservationRequestToast } from '@/shared/components/ReservationRequestToast';

interface CreateTripFormProps {
  // Prenom + nom du conducteur pour le titre personnalise
  driverName?: string;
  // Valeurs pre-remplies issues d'un TripWay (depart, arrivee, date, heure)
  initialValues?: TripWayPrefill;
  /** Véhicules du conducteur, fournis par la page via GET /api/vehicles */
  vehicles: MockVehicle[];
}

export const CreateTripForm: React.FC<CreateTripFormProps> = ({
  driverName = "Conducteur",
  initialValues,
  vehicles,
}) => {
  const appState = useAppState();
  // Récupère le prénom du conducteur connecté, sinon utilise la valeur par défaut
  driverName = appState.userConnected?.firstName || driverName;

  // Polyline du circuit ou brouillon — initialisée depuis sessionStorage au montage
  const [circuitLatLngs, setCircuitLatLngs] = useState<[number, number][] | null>(() => {
    if (typeof window === 'undefined') return null;

    const draftStored = sessionStorage.getItem('quickPlanDraft');
    if (draftStored) {
      try {
        const draft = JSON.parse(draftStored);
        if (Array.isArray(draft.polyline) && draft.polyline.length >= 2) {
          return draft.polyline as [number, number][];
        }
      } catch { /* Brouillon invalide */ }
    }

    const circuitStored = sessionStorage.getItem('selectedCircuit');
    if (circuitStored) {
      try {
        const circuit = JSON.parse(circuitStored);
        return Array.isArray(circuit.latLngs) ? (circuit.latLngs as [number, number][]) : null;
      } catch { /* Circuit invalide */ }
    }

    return null;
  });

  const {
    form,
    errors,
    isSubmitting,
    tripToast,
    setField,
    setPreference,
    incrementPrice,
    decrementPrice,
    incrementAvailableSeats,
    decrementAvailableSeats,
    onVehicleChange,
    handlePublish,
    handleSaveDraft,
    dismissToast,
  } = useCreateTrip(vehicles, initialValues);

  // Calcul dynamique de la polyline si absente mais lieux disponibles
  useEffect(() => {
    if (circuitLatLngs) return;
    const dep = form.departureLocation;
    const arr = form.arrivalLocation;
    if (!dep || !arr) return;

    let cancelled = false;

    (async () => {
      try {
        const [depResults, arrResults] = await Promise.all([
          getProposals(dep),
          getProposals(arr),
        ]);
        if (cancelled || !depResults.length || !arrResults.length) return;

        const depCoords = depResults[0].coordinates;
        const arrCoords = arrResults[0].coordinates;

        const route = await fetchRoute(depCoords, arrCoords);
        if (cancelled || !route.latLngs?.length) return;

        setCircuitLatLngs(route.latLngs);

        if (typeof window !== 'undefined') {
          const raw = sessionStorage.getItem('quickPlanDraft');
          if (raw) {
            try {
              const draft = JSON.parse(raw);
              draft.polyline = route.latLngs;
              draft.departureCoords = [depCoords[1], depCoords[0]];
              draft.arrivalCoords   = [arrCoords[1], arrCoords[0]];
              sessionStorage.setItem('quickPlanDraft', JSON.stringify(draft));
            } catch { /* ignore */ }
          }
        }
      } catch { /* Échec silencieux */ }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nettoyage de la variable de transition conducteur au démontage
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingTripDateTime');
      }
    };
  }, []);

  return (
    <div className="min-h-screen text-black" style={{ background: '#f0f4f8' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Titre personnalise */}
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          {'Creer votre trajet, '}
          <span style={{ color: '#08316e' }}>
            {'Captain '}
            {driverName}
          </span>
        </h1>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Colonne gauche */}
          <div className="flex flex-col gap-5">
            <BasicInfoSection
              form={form}
              errors={errors}
              setField={setField}
            />
            <PricingLeftSection
              form={form}
              setField={setField}
              setPreference={setPreference}
            />
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col gap-5">
            <VehicleSection
              form={form}
              errors={errors}
              vehicles={vehicles}
              onVehicleChange={onVehicleChange}
              incrementAvailableSeats={incrementAvailableSeats}
              decrementAvailableSeats={decrementAvailableSeats}
            />
            <PricingRightSection
              form={form}
              incrementPrice={incrementPrice}
              decrementPrice={decrementPrice}
              setField={setField}
            />
            <MapPreviewSection
              departureLocation={form.departureLocation}
              arrivalLocation={form.arrivalLocation}
              latLngs={circuitLatLngs ?? undefined}
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-8 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#08316e' }}
          >
            {isSubmitting ? 'Publication...' : 'Publier le Trajet'}
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-8 py-3 rounded-lg font-semibold text-sm border border-gray-300 bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Sauvegarder comme brouillon
          </button>
        </div>
      </div>

      {/* Toast publication / brouillon */}
      <ReservationRequestToast
        isOpen={tripToast.isOpen}
        success={tripToast.success}
        message={tripToast.message}
        onOk={dismissToast}
        okLabel="Fermer"
      />
    </div>
  );
};
