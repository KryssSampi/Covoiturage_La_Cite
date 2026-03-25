'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreateTripFormState,
  DEFAULT_CREATE_TRIP_FORM,
} from '../types';
import { MIN_PRICE, MAX_PRICE, MIN_AVAILABLE_SEATS } from '../constants/trip.constants';
import type { MockVehicle } from '../constants/trip.constants';
import { AppState, useAppState } from '@/core/state/app_state';
import { DEFAULT_TRIP_PREFERENCES } from '@/core/models/TripModel';

// ── Erreurs de validation du formulaire ──────────────────────────
export interface CreateTripFormErrors {
  departureLocation?: string;
  arrivalLocation?:   string;
  departureDate?:     string;
  departureTime?:     string;
  vehicleId?:         string;
  availableSeats?:    string;
  pricePerPassenger?: string;
}

// ── Toast après publication / brouillon ──────────────────────────
export interface CreateTripToast {
  isOpen:   boolean;
  success:  boolean;
  /** Message affiché dans le toast */
  message:  string;
}

// ── Valeur de retour du hook ─────────────────────────────────────
export interface UseCreateTripReturn {
  form:                    CreateTripFormState;
  errors:                  CreateTripFormErrors;
  isSubmitting:            boolean;
  tripToast:               CreateTripToast;
  setField:                <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
  setPreference:           (key: keyof CreateTripFormState['preferences'], value: boolean) => void;
  incrementPrice:          () => void;
  decrementPrice:          () => void;
  incrementAvailableSeats: () => void;
  decrementAvailableSeats: () => void;
  onVehicleChange:         (vehicleId: string) => void;
  handlePublish:           () => Promise<void>;
  handleSaveDraft:         () => Promise<void>;
  dismissToast:            () => void;
  validate:                () => boolean;
}

// ── Hook principal ────────────────────────────────────────────────
export function useCreateTrip(
  vehicles: MockVehicle[],
  initialValues?: Partial<CreateTripFormState>,
): UseCreateTripReturn {
  const router    = useRouter();
  const appState  = useAppState();

  const [form, setForm] = useState<CreateTripFormState>({
    ...DEFAULT_CREATE_TRIP_FORM,
    // Si un seul véhicule, le pré-sélectionner automatiquement
    ...(vehicles.length === 1 ? { vehicleId: vehicles[0].id, maxPassengers: vehicles[0].maxPassengers } : {}),
    ...initialValues,
  });
  const [errors, setErrors]             = useState<CreateTripFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripToast, setTripToast]       = useState<CreateTripToast>({ isOpen: false, success: false, message: '' });

  // ── Mise a jour generique d'un champ ────────────────────────────
  function setField<K extends keyof CreateTripFormState>(
    key: K,
    value: CreateTripFormState[K],
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof CreateTripFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  // ── Mise a jour d'une preference passager ───────────────────────
  function setPreference(
    key: keyof CreateTripFormState['preferences'],
    value: boolean,
  ): void {
    setForm((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  }

  // ── Ajustements prix ────────────────────────────────────────────
  function incrementPrice(): void {
    setForm((prev) => ({ ...prev, pricePerPassenger: Math.min(prev.pricePerPassenger + 1, MAX_PRICE) }));
  }
  function decrementPrice(): void {
    setForm((prev) => ({ ...prev, pricePerPassenger: Math.max(prev.pricePerPassenger - 1, MIN_PRICE) }));
  }

  // ── Ajustements places disponibles ──────────────────────────────
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

  // ── Changement de vehicule → mise a jour du total de sieges ─────
  function onVehicleChange(vehicleId: string): void {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;
    setForm((prev) => ({
      ...prev,
      vehicleId:      vehicle.id,
      maxPassengers:  vehicle.maxPassengers,
      availableSeats: Math.min(prev.availableSeats, vehicle.maxPassengers - 1),
    }));
  }

  // ── Validation du formulaire (uniquement à la publication) ──────
  function validate(): boolean {
    const newErrors: CreateTripFormErrors = {};

    if (!form.departureLocation.trim()) {
      newErrors.departureLocation = 'Le lieu de depart est requis.';
    }
    if (!form.arrivalLocation.trim()) {
      newErrors.arrivalLocation = "Le lieu d'arrivee est requis.";
    }
    if (!form.departureDate) {
      newErrors.departureDate = 'La date de depart est requise.';
    }
    if (!form.departureTime) {
      newErrors.departureTime = "L'heure de depart est requise.";
    }
    if (!form.vehicleId) {
      newErrors.vehicleId = 'Veuillez selectionner un vehicule.';
    }
    if (form.availableSeats < MIN_AVAILABLE_SEATS) {
      newErrors.availableSeats = `Minimum ${MIN_AVAILABLE_SEATS} place disponible.`;
    }
    if (form.pricePerPassenger < MIN_PRICE || form.pricePerPassenger > MAX_PRICE) {
      newErrors.pricePerPassenger = `Le prix doit etre entre ${MIN_PRICE} $ et ${MAX_PRICE} $.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Récupération des coordonnées géo depuis sessionStorage ───────
  function readGeoFromSession() {
    let departureCoords = { lat: 0, lng: 0 };
    let arrivalCoords   = { lat: 0, lng: 0 };
    let polyline: [number, number][] = [];

    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('quickPlanDraft');
      if (raw) {
        try {
          const draft = JSON.parse(raw);
          if (Array.isArray(draft.departureCoords) && draft.departureCoords.length === 2) {
            departureCoords = { lat: draft.departureCoords[0], lng: draft.departureCoords[1] };
          }
          if (Array.isArray(draft.arrivalCoords) && draft.arrivalCoords.length === 2) {
            arrivalCoords = { lat: draft.arrivalCoords[0], lng: draft.arrivalCoords[1] };
          }
          if (Array.isArray(draft.polyline)) {
            polyline = draft.polyline;
          }
        } catch { /* brouillon invalide */ }
      }
    }

    return { departureCoords, arrivalCoords, polyline };
  }

  // ── Publication du trajet via POST /api/trips ────────────────────
  async function handlePublish(): Promise<void> {
    if (!validate()) return;

    const currentUser = appState.userConnected;
    if (!currentUser) return;

    setIsSubmitting(true);

    const { departureCoords, arrivalCoords, polyline } = readGeoFromSession();

    const tripPayload = {
      driverId:   currentUser.id,
      vehicleId:  form.vehicleId,
      departure: {
        label:       form.departureLocation,
        fullAddress: form.departureLocation,
        coordinates: departureCoords,
      },
      arrival: {
        label:       form.arrivalLocation,
        fullAddress: form.arrivalLocation,
        coordinates: arrivalCoords,
      },
      waypoints:           [],
      polyline,
      departureDate:       form.departureDate,
      departureTime:       form.departureTime,
      maxPassengers:       form.maxPassengers,
      currentPassengers:   0,
      passengerIds:        [],
      pricePerPassenger:   form.pricePerPassenger,
      paymentMethod:       form.paymentMethod,
      status:              'published',
      departureType:       'planned',
      tripType:            form.tripType,
      preferences: {
        ...DEFAULT_TRIP_PREFERENCES,
        baggageAllowed:    form.preferences.baggageAllowed,
        petsAllowed:       form.preferences.petsAllowed,
        smokingAllowed:    form.preferences.smokingAllowed,
        musicAllowed:      form.preferences.musicAllowed,
        flexibleItinerary: form.preferences.flexibleItinerary,
      },
      recurrenceDays:           form.recurrenceDays,
      recurrenceEndDate:        form.recurrenceEndDate,
      estimatedDistanceKm:      form.estimatedDistance,
      estimatedDurationMinutes: form.estimatedDuration,
      notes:                    form.notes,
    };

    try {
      const res  = await fetch('/api/trips', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(tripPayload),
      });

      const data = await res.json() as { id?: string; departureDate?: string; error?: string };

      if (res.ok) {
        setTripToast({
          isOpen:  true,
          success: true,
          message: data.id ?? '',
        });
        // Naviguer vers le planificateur conducteur après fermeture du toast
        router.push(`/driver/${currentUser.id}/planifier`);
      } else {
        setTripToast({
          isOpen:  true,
          success: false,
          message: data.error ?? 'Erreur lors de la publication.',
        });
      }
    } catch {
      setTripToast({ isOpen: true, success: false, message: 'Erreur réseau.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Sauvegarde en brouillon via POST /api/drafts ─────────────────
  async function handleSaveDraft(): Promise<void> {
    const currentUser = appState.userConnected;
    if (!currentUser) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const draftPayload = {
      driverId:          currentUser.id,
      departureLocation: form.departureLocation,
      arrivalLocation:   form.arrivalLocation,
      departureDate:     form.departureDate,
      departureTime:     form.departureTime,
      vehicleId:         form.vehicleId,
      maxPassengers:     form.maxPassengers,
      availableSeats:    form.availableSeats,
      pricePerPassenger: form.pricePerPassenger,
      paymentMethod:     form.paymentMethod,
      preferences:       form.preferences,
      notes:             form.notes ?? '',
      updatedAt:         now,
    };

    try {
      const res  = await fetch('/api/drafts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(draftPayload),
      });

      const data = await res.json() as { id?: string; error?: string };

      if (res.ok) {
        setTripToast({
          isOpen:  true,
          success: true,
          message: `Brouillon sauvegardé (${data.id ?? ''})`,
        });
      } else {
        setTripToast({
          isOpen:  true,
          success: false,
          message: data.error ?? 'Erreur lors de la sauvegarde.',
        });
      }
    } catch {
      setTripToast({ isOpen: true, success: false, message: 'Erreur réseau.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissToast(): void {
    const appState = AppState.MainInstance;

    router.push(`/driver/brouillons/${appState.userConnected?.id}`);
    setTripToast((prev) => ({ ...prev, isOpen: false }));
  }

  return {
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
    validate,
  };
}
