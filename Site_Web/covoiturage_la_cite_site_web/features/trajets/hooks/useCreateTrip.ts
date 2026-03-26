'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  CreateTripFormState,
  DEFAULT_CREATE_TRIP_FORM,
} from '../types';
import { MIN_PRICE, MAX_PRICE, MIN_AVAILABLE_SEATS } from '../constants/trip.constants';
import type { MockVehicle } from '../constants/trip.constants';
import { AppState, useAppState } from '@/core/state/app_state';
import { getProposals } from '@/core/services/location.suggestion';
import { buildDateRange, isDateRangeBlockedByIndisponibility } from '@/core/utils/indisponibility.utils';
import type { IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { buildTripPayload, hasGeoPoint, readTripGeoFromSession } from '@/core/utils/create-trip-form.utils';

export interface CreateTripFormErrors {
  departureLocation?: string;
  arrivalLocation?: string;
  departureDate?: string;
  departureTime?: string;
  vehicleId?: string;
  availableSeats?: string;
  pricePerPassenger?: string;
}

export interface CreateTripToast {
  isOpen: boolean;
  success: boolean;
  message: string;
  title?: string;
  redirectTripId?: string;
}

export interface UseCreateTripReturn {
  form: CreateTripFormState;
  errors: CreateTripFormErrors;
  isSubmitting: boolean;
  tripToast: CreateTripToast;
  showIndispoWarning: boolean;
  setField: <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
  setPreference: (key: keyof CreateTripFormState['preferences'], value: boolean) => void;
  incrementPrice: () => void;
  decrementPrice: () => void;
  incrementAvailableSeats: () => void;
  decrementAvailableSeats: () => void;
  onVehicleChange: (vehicleId: string) => void;
  handlePublish: () => Promise<void>;
  confirmPublishDespiteIndispo: () => Promise<void>;
  dismissIndispoWarning: () => void;
  handleSaveDraft: () => Promise<void>;
  dismissToast: () => void;
  validate: () => boolean;
}

function createEmptyToast(): CreateTripToast {
  return { isOpen: false, success: false, message: '' };
}

export function useCreateTrip(
  vehicles: MockVehicle[],
  initialValues?: Partial<CreateTripFormState>,
): UseCreateTripReturn {
  const router = useRouter();
  const appState = useAppState();

  const [form, setForm] = useState<CreateTripFormState>({
    ...DEFAULT_CREATE_TRIP_FORM,
    ...(vehicles.length === 1 ? { vehicleId: vehicles[0].id, maxPassengers: vehicles[0].maxPassengers } : {}),
    ...initialValues,
  });
  const [errors, setErrors] = useState<CreateTripFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripToast, setTripToast] = useState<CreateTripToast>(createEmptyToast());
  const [showIndispoWarning, setShowIndispoWarning] = useState(false);

  function setField<K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof CreateTripFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function setPreference(key: keyof CreateTripFormState['preferences'], value: boolean): void {
    setForm((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  }

  function incrementPrice(): void {
    setForm((prev) => ({ ...prev, pricePerPassenger: Math.min(prev.pricePerPassenger + 1, MAX_PRICE) }));
  }

  function decrementPrice(): void {
    setForm((prev) => ({ ...prev, pricePerPassenger: Math.max(prev.pricePerPassenger - 1, MIN_PRICE) }));
  }

  function incrementAvailableSeats(): void {
    setForm((prev) => ({
      ...prev,
      availableSeats: Math.min(prev.availableSeats + 1, prev.maxPassengers - 1),
    }));
  }

  function decrementAvailableSeats(): void {
    setForm((prev) => ({
      ...prev,
      availableSeats: Math.max(prev.availableSeats - 1, MIN_AVAILABLE_SEATS),
    }));
  }

  useEffect(() => {
    if (vehicles.length === 1 && !form.vehicleId) {
      setForm((prev) => ({
        ...prev,
        vehicleId: vehicles[0].id,
        maxPassengers: vehicles[0].maxPassengers,
        availableSeats: Math.min(prev.availableSeats, vehicles[0].maxPassengers - 1),
      }));
    }
  }, [form.vehicleId, vehicles]);

  function onVehicleChange(vehicleId: string): void {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) return;

    setForm((prev) => ({
      ...prev,
      vehicleId: vehicle.id,
      maxPassengers: vehicle.maxPassengers,
      availableSeats: Math.min(prev.availableSeats, vehicle.maxPassengers - 1),
    }));
  }

  function validate(): boolean {
    const nextErrors: CreateTripFormErrors = {};

    if (!form.departureLocation.trim()) {
      nextErrors.departureLocation = 'Le lieu de depart est requis.';
    }
    if (!form.arrivalLocation.trim()) {
      nextErrors.arrivalLocation = "Le lieu d'arrivee est requis.";
    }
    if (!form.departureDate) {
      nextErrors.departureDate = 'La date de depart est requise.';
    }
    if (!form.departureTime) {
      nextErrors.departureTime = "L'heure de depart est requise.";
    }
    if (!form.vehicleId) {
      nextErrors.vehicleId = 'Veuillez selectionner un vehicule.';
    }
    if (form.availableSeats < MIN_AVAILABLE_SEATS) {
      nextErrors.availableSeats = `Minimum ${MIN_AVAILABLE_SEATS} place disponible.`;
    }
    if (form.pricePerPassenger < MIN_PRICE || form.pricePerPassenger > MAX_PRICE) {
      nextErrors.pricePerPassenger = `Le prix doit etre entre ${MIN_PRICE} $ et ${MAX_PRICE} $.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function readGeoFromSession() {
    return readTripGeoFromSession(typeof window === 'undefined' ? null : sessionStorage);
  }

  async function doPublish(): Promise<void> {
    const currentUser = appState.userConnected;
    if (!currentUser) return;

    setIsSubmitting(true);

    let { departureCoords, arrivalCoords, polyline } = readGeoFromSession();
    const { waypoints } = readGeoFromSession();

    if (!hasGeoPoint(departureCoords) && form.departureLocation) {
      try {
        const results = await getProposals(form.departureLocation);
        if (results.length > 0) {
          departureCoords = { lat: results[0].coordinates[1], lng: results[0].coordinates[0] };
        }
      } catch {
        // geocoding fallback only
      }
    }

    if (!hasGeoPoint(arrivalCoords) && form.arrivalLocation) {
      try {
        const results = await getProposals(form.arrivalLocation);
        if (results.length > 0) {
          arrivalCoords = { lat: results[0].coordinates[1], lng: results[0].coordinates[0] };
        }
      } catch {
        // geocoding fallback only
      }
    }

    if (polyline.length < 2 && hasGeoPoint(departureCoords) && hasGeoPoint(arrivalCoords)) {
      polyline = [
        [departureCoords.lat, departureCoords.lng],
        [arrivalCoords.lat, arrivalCoords.lng],
      ];
    }

    const tripPayload = buildTripPayload({
      driverId: currentUser.id,
      vehicleId: form.vehicleId,
      departureLocation: form.departureLocation,
      arrivalLocation: form.arrivalLocation,
      departureCoords,
      arrivalCoords,
      waypoints,
      polyline,
      departureDate: form.departureDate,
      departureTime: form.departureTime,
      availableSeats: form.availableSeats,
      pricePerPassenger: form.pricePerPassenger,
      paymentMethod: form.paymentMethod,
      tripType: form.tripType,
      preferences: form.preferences,
      recurrenceDays: form.recurrenceDays,
      recurrenceEndDate: form.recurrenceEndDate,
      estimatedDistance: form.estimatedDistance,
      estimatedDuration: form.estimatedDuration,
      notes: form.notes,
    });

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripPayload),
      });

      const data = await response.json() as { id?: string; error?: string };

      if (response.ok) {
        setTripToast({
          isOpen: true,
          success: true,
          title: 'Trajet publie',
          message: 'Votre trajet a ete publie et sera visible dans votre planificateur.',
          redirectTripId: data.id,
        });
      } else {
        setTripToast({
          isOpen: true,
          success: false,
          title: 'Publication impossible',
          message: data.error ?? 'Erreur lors de la publication.',
        });
      }
    } catch {
      setTripToast({
        isOpen: true,
        success: false,
        title: 'Erreur reseau',
        message: 'Erreur reseau.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublish(): Promise<void> {
    if (!validate()) return;

    const currentUser = appState.userConnected;
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/indisponibilities/${currentUser.id}`);
      if (response.ok) {
        const indispo = await response.json() as IndisponibilityModel | null;
        const range = buildDateRange(form.departureDate, form.departureTime, form.estimatedDuration ?? 60);
        if (isDateRangeBlockedByIndisponibility(range, indispo)) {
          setShowIndispoWarning(true);
          return;
        }
      }
    } catch {
      // optional preflight check
    }

    await doPublish();
  }

  async function confirmPublishDespiteIndispo(): Promise<void> {
    setShowIndispoWarning(false);
    await doPublish();
  }

  function dismissIndispoWarning(): void {
    setShowIndispoWarning(false);
  }

  async function handleSaveDraft(): Promise<void> {
    const currentUser = appState.userConnected;
    if (!currentUser) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const draftPayload = {
      driverId: currentUser.id,
      departureLocation: form.departureLocation,
      arrivalLocation: form.arrivalLocation,
      departureDate: form.departureDate,
      departureTime: form.departureTime,
      vehicleId: form.vehicleId,
      maxPassengers: form.maxPassengers,
      availableSeats: form.availableSeats,
      pricePerPassenger: form.pricePerPassenger,
      paymentMethod: form.paymentMethod,
      preferences: form.preferences,
      notes: form.notes ?? '',
      updatedAt: now,
    };

    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload),
      });

      const data = await response.json() as { id?: string; error?: string };

      if (response.ok) {
        setTripToast({
          isOpen: true,
          success: true,
          title: 'Brouillon sauvegarde',
          message: `Le brouillon a bien ete sauvegarde${data.id ? ` (${data.id})` : ''}.`,
        });
      } else {
        setTripToast({
          isOpen: true,
          success: false,
          title: 'Sauvegarde impossible',
          message: data.error ?? 'Erreur lors de la sauvegarde.',
        });
      }
    } catch {
      setTripToast({
        isOpen: true,
        success: false,
        title: 'Erreur reseau',
        message: 'Erreur reseau.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissToast(): void {
    const currentUser = AppState.MainInstance.userConnected;
    const newTripId = tripToast.redirectTripId;

    setTripToast((prev) => ({ ...prev, isOpen: false }));

    if (tripToast.success && currentUser && newTripId) {
      try {
        sessionStorage.removeItem('selectedCircuit');
        sessionStorage.removeItem('createTripAccess');
        sessionStorage.removeItem('pendingTripDateTime');
      } catch {
        // sessionStorage optional
      }

      const params = new URLSearchParams({ showAll: 'true' });
      params.set('newTripId', newTripId);
      router.push(`/driver/planifier/${currentUser.id}?${params.toString()}`);
    }
  }

  return {
    form,
    errors,
    isSubmitting,
    tripToast,
    showIndispoWarning,
    setField,
    setPreference,
    incrementPrice,
    decrementPrice,
    incrementAvailableSeats,
    decrementAvailableSeats,
    onVehicleChange,
    handlePublish,
    confirmPublishDespiteIndispo,
    dismissIndispoWarning,
    handleSaveDraft,
    dismissToast,
    validate,
  };
}
