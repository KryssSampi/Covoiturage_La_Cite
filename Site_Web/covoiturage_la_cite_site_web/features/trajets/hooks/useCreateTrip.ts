'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreateTripFormState,
  DEFAULT_CREATE_TRIP_FORM,
} from '../types';
import { MIN_PRICE, MAX_PRICE, MIN_AVAILABLE_SEATS } from '../constants/trip.constants';
import { useDb } from '@/core/context/db.context';
import { useTripActions } from '@/core/context/trip.context';
import { useAppState } from '@/core/state/app_state';
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

// ── Valeur de retour du hook ─────────────────────────────────────
export interface UseCreateTripReturn {
  form:                    CreateTripFormState;
  errors:                  CreateTripFormErrors;
  isSubmitting:            boolean;
  /** Véhicules réels du conducteur connecté (pour le sélecteur) */
  vehicles:                Array<{ id: string; label: string; maxPassengers: number }>;
  setField:                <K extends keyof CreateTripFormState>(key: K, value: CreateTripFormState[K]) => void;
  setPreference:           (key: keyof CreateTripFormState['preferences'], value: boolean) => void;
  incrementPrice:          () => void;
  decrementPrice:          () => void;
  incrementAvailableSeats: () => void;
  decrementAvailableSeats: () => void;
  onVehicleChange:         (vehicleId: string) => void;
  handlePublish:           () => Promise<void>;
  handleSaveDraft:         () => Promise<void>;
  validate:                () => boolean;
}

// ── Hook principal ────────────────────────────────────────────────
export function useCreateTrip(
  initialValues?: Partial<CreateTripFormState>,
): UseCreateTripReturn {
  const router       = useRouter();
  const appState     = useAppState();
  const { myVehicles } = useDb();
  const { createTrip, isCreating } = useTripActions();

  // Véhicules réels du conducteur, mappés en format léger pour le sélecteur
  const vehicles = useMemo(
    () =>
      myVehicles.map((v) => ({
        id:         v.id,
        label:      `${v.make} ${v.model} ${v.year}`,
        maxPassengers: v.maxSeats,
      })),
    [myVehicles]
  );
  // Fusion des valeurs par defaut avec les valeurs pre-remplies (TripWay)
  const [form, setForm] = useState<CreateTripFormState>({
    ...DEFAULT_CREATE_TRIP_FORM,
    ...initialValues,
  });

  const [errors, setErrors] = useState<CreateTripFormErrors>({});
  // isSubmitting provient de isCreating (TripContext) pour la cohérence de l'état
  const isSubmitting = isCreating;

  // ── Mise a jour generique d'un champ ────────────────────────────
  function setField<K extends keyof CreateTripFormState>(
    key: K,
    value: CreateTripFormState[K],
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Effacement de l'erreur associee au champ modifie
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
    setForm((prev) => ({
      ...prev,
      pricePerPassenger: Math.min(prev.pricePerPassenger + 1, MAX_PRICE),
    }));
  }

  function decrementPrice(): void {
    setForm((prev) => ({
      ...prev,
      pricePerPassenger: Math.max(prev.pricePerPassenger - 1, MIN_PRICE),
    }));
  }

  // ── Ajustements places disponibles ──────────────────────────────
  function incrementAvailableSeats(): void {
    setForm((prev) => {
      const max = prev.maxPassengers - 1; // Au moins 1 place pour le conducteur
      return {
        ...prev,
        availableSeats: Math.min(prev.availableSeats + 1, max),
      };
    });
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

  // ── Validation du formulaire ─────────────────────────────────────
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

  // ── Publication du trajet ────────────────────────────────────────
  async function handlePublish(): Promise<void> {
    if (!validate()) return;

    const currentUser = appState.userConnected;
    if (!currentUser) return;

    try {
      // Récupération des données géo depuis le brouillon QuickPlan (si disponible)
      let departureCoords = { lat: 0, lng: 0 };
      let arrivalCoords = { lat: 0, lng: 0 };
      let polyline: [number, number][] = [];

      if (typeof window !== 'undefined') {
        const draftStored = sessionStorage.getItem('quickPlanDraft');
        if (draftStored) {
          try {
            const draft = JSON.parse(draftStored);
            if (Array.isArray(draft.departureCoords) && draft.departureCoords.length === 2) {
              departureCoords = { lat: draft.departureCoords[0], lng: draft.departureCoords[1] };
            }
            if (Array.isArray(draft.arrivalCoords) && draft.arrivalCoords.length === 2) {
              arrivalCoords = { lat: draft.arrivalCoords[0], lng: draft.arrivalCoords[1] };
            }
            if (Array.isArray(draft.polyline)) {
              polyline = draft.polyline;
            }
          } catch { /* Brouillon invalide — on utilise les valeurs par défaut */ }
        }
      }

      // Construction du TripModel depuis les valeurs du formulaire
      await createTrip({
        driverId:       currentUser.id,
        vehicleId:      form.vehicleId,
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
        recurrenceDays:      form.recurrenceDays,
        recurrenceEndDate:   form.recurrenceEndDate,
        estimatedDistanceKm: form.estimatedDistance,
        estimatedDurationMinutes: form.estimatedDuration,
        notes:               form.notes,
      });

      // Navigation vers la vue du trajet créé
      router.push(`/driver/${currentUser.id}/planifier`);
      return;
    } catch (err) {
      console.error('[useCreateTrip] Erreur lors de la publication :', err);
    }
  }

  // ── Sauvegarde en brouillon ──────────────────────────────────────
  async function handleSaveDraft(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const draft = {
        id:                `draft-${Date.now()}`,
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
        notes:             form.notes ?? "",
        createdAt:         now,
        updatedAt:         now,
      };
      // Émet un événement pour persister le brouillon dans la liste locale
      window.dispatchEvent(new CustomEvent("draft:save", { detail: draft }));
    } catch (err) {
      console.error('[useCreateTrip] Erreur lors de la sauvegarde du brouillon :', err);
    }
  }

  return {
    form,
    errors,
    isSubmitting,
    vehicles,
    setField,
    setPreference,
    incrementPrice,
    decrementPrice,
    incrementAvailableSeats,
    decrementAvailableSeats,
    onVehicleChange,
    handlePublish,
    handleSaveDraft,
    validate,
  };
}
