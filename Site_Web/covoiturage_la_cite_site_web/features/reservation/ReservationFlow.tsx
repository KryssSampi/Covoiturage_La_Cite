'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface TripForReservation {
  id: string;
  departure: { label: string; fullAddress: string; coordinates: { lat: number; lng: number } };
  arrival: { label: string; fullAddress: string; coordinates: { lat: number; lng: number } };
  departureDate: string;
  departureTime: string;
  estimatedDurationMinutes?: number;
  pricePerPassenger: number;
  passengerPrice: number;
  maxPassengers: number;
  availableSeats: number;
  paymentMethod: string;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    rating: number;
    tripCount: number;
    verified: boolean;
  };
  preferences?: {
    baggageAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    musicAllowed: boolean;
    conversationLevel: string;
  };
}

export interface ReservationResult {
  id: string;
  tripId: string;
  status: string;
}

type Step = 'details' | 'confirm' | 'success' | 'error';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function PreferenceTag({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
      allowed
        ? 'bg-green-50 text-green-700 border-green-100'
        : 'bg-gray-50 text-gray-400 border-gray-100 line-through'
    }`}>
      {label}
    </span>
  );
}

function TripSummary({ trip }: { trip: TripForReservation }) {
  const date = new Date(`${trip.departureDate}T${trip.departureTime}:00`)
    .toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Route principale */}
      <div className="bg-gradient-to-r from-[#08316e] to-blue-700 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
            <div className="w-0.5 h-8 bg-white/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{trip.departure.label}</p>
            <p className="font-semibold text-sm truncate mt-4 text-white/80">{trip.arrival.label}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold text-xl">{trip.passengerPrice.toFixed(2)} $</p>
            <p className="text-white/60 text-xs">frais inclus</p>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="px-5 py-4 space-y-4">
        {/* Date & heure */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="capitalize">{date}</span>
          <span className="text-gray-400">·</span>
          <span className="font-medium">{trip.departureTime}</span>
          {trip.estimatedDurationMinutes && (
            <>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{Math.round(trip.estimatedDurationMinutes)} min</span>
            </>
          )}
        </div>

        {/* Conducteur */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          {trip.driver.avatarUrl ? (
            <img src={trip.driver.avatarUrl} alt={`${trip.driver.firstName} ${trip.driver.lastName}`}
              className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#08316e] flex items-center justify-center text-white font-bold text-sm">
              {trip.driver.firstName[0]}{trip.driver.lastName[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-gray-900">
                {trip.driver.firstName} {trip.driver.lastName}
              </p>
              {trip.driver.verified && (
                <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full border border-blue-100">
                  Vérifié ✓
                </span>
              )}
            </div>
            <StarRating rating={trip.driver.rating} />
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>{trip.driver.tripCount} trajet{trip.driver.tripCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Places & paiement */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            {trip.availableSeats} place{trip.availableSeats !== 1 ? 's' : ''} disponible{trip.availableSeats !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {trip.paymentMethod === 'cash' ? 'Comptant' : 'Interac'}
          </span>
        </div>

        {/* Préférences */}
        {trip.preferences && (
          <div className="flex flex-wrap gap-1.5">
            <PreferenceTag allowed={trip.preferences.baggageAllowed} label="🧳 Bagages" />
            <PreferenceTag allowed={trip.preferences.petsAllowed} label="🐾 Animaux" />
            <PreferenceTag allowed={trip.preferences.smokingAllowed} label="🚬 Fumeur" />
            <PreferenceTag allowed={trip.preferences.musicAllowed} label="🎵 Musique" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservationFlow({
  trip,
  passengerId,
  onSuccess,
  onCancel,
}: {
  trip: TripForReservation;
  passengerId: string;
  onSuccess?: (result: ReservationResult) => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('details');
  const [pickupNote, setPickupNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReservationResult | null>(null);

  const handleReserver = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          seatsRequested: 1,
          pickupNote: pickupNote.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur lors de la réservation');
      }

      const reservationResult: ReservationResult = {
        id: data.id ?? data.reservationId ?? '',
        tripId: trip.id,
        status: data.status ?? 'pending',
      };
      setResult(reservationResult);
      setStep('success');
      onSuccess?.(reservationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [trip.id, pickupNote, onSuccess]);

  const handleGoBack = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [onCancel, router]);

  // Étape SUCCESS
  if (step === 'success') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demande envoyée !</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Votre demande de réservation a été transmise à{' '}
            <span className="font-semibold text-gray-700">{trip.driver.firstName}</span>.
            Vous serez notifié dès qu'il aura répondu.
          </p>
        </div>
        <div className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-left space-y-1">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Récapitulatif</p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{trip.departure.label}</span>
            {' → '}
            <span className="font-medium">{trip.arrival.label}</span>
          </p>
          <p className="text-sm text-gray-500">
            Montant : <span className="font-semibold text-gray-900">{trip.passengerPrice.toFixed(2)} $</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => router.push(`/passenger/${passengerId}`)}
            className="w-full py-3 bg-[#08316e] text-white font-medium rounded-xl hover:bg-blue-800 transition-colors"
          >
            Voir mes réservations
          </button>
          <button
            onClick={handleGoBack}
            className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  // Étape ERROR
  if (step === 'error') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Échec de la réservation</h2>
          <p className="text-red-500 mt-2 text-sm">{error}</p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setStep('confirm')}
            className="w-full py-3 bg-[#08316e] text-white font-medium rounded-xl hover:bg-blue-800 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={handleGoBack}
            className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Étape DETAILS
  if (step === 'details') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#08316e]">Détails du trajet</h1>
        </div>

        <TripSummary trip={trip} />

        {/* Note de ramassage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Note pour le conducteur (optionnel)</h3>
          <textarea
            value={pickupNote}
            onChange={(e) => setPickupNote(e.target.value)}
            placeholder="Ex : Je serai devant l'entrée principale avec un sac rouge…"
            rows={3}
            maxLength={280}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{pickupNote.length}/280</p>
        </div>

        {/* Prix final */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Total à payer</p>
            <p className="text-xs text-blue-600 mt-0.5">Frais de service inclus (15%)</p>
          </div>
          <p className="text-2xl font-bold text-[#08316e]">{trip.passengerPrice.toFixed(2)} $</p>
        </div>

        <button
          onClick={() => setStep('confirm')}
          className="w-full py-3.5 bg-[#08316e] text-white font-semibold rounded-2xl hover:bg-blue-800 transition-colors text-base"
        >
          Continuer
        </button>
      </div>
    );
  }

  // Étape CONFIRM
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep('details')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Retour"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#08316e]">Confirmer la réservation</h1>
      </div>

      {/* Résumé compact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <span className="truncate">{trip.departure.label}</span>
          <span className="text-gray-400 flex-shrink-0">→</span>
          <span className="truncate">{trip.arrival.label}</span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(`${trip.departureDate}T${trip.departureTime}:00`).toLocaleDateString('fr-CA', {
            weekday: 'long', month: 'long', day: 'numeric',
          })} à {trip.departureTime}
          {' · '}Conducteur : {trip.driver.firstName} {trip.driver.lastName}
        </div>
        {pickupNote && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600">
            <span className="font-medium">Note : </span>{pickupNote}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
        <p className="text-sm font-medium text-blue-900">Montant total</p>
        <p className="text-2xl font-bold text-[#08316e]">{trip.passengerPrice.toFixed(2)} $</p>
      </div>

      {/* Conditions */}
      <p className="text-xs text-gray-400 text-center px-2">
        En confirmant, vous acceptez les{' '}
        <a href="/conditions" className="text-blue-600 hover:underline">conditions d'utilisation</a>.
        Votre demande sera envoyée au conducteur qui devra l'accepter.
      </p>

      <button
        onClick={handleReserver}
        disabled={loading}
        className="w-full py-3.5 bg-[#08316e] text-white font-semibold rounded-2xl hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Envoi en cours…
          </>
        ) : (
          'Confirmer la réservation'
        )}
      </button>
    </div>
  );
}
