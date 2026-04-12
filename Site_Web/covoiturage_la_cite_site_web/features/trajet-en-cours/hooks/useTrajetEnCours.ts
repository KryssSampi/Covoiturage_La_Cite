// ═══════════════════════════════════════════════════════════════════════
// Hook useTrajetEnCours — Logique de récupération des données et du polling
// ═══════════════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { EvaluationState } from '../types/trajet-en-cours.types';
import type { Correspondant, MoiInfo } from '../types/messagerie.types';
import type { UserModel } from '@/core/models/UserModel';
import type { TripModel } from '@/core/models/TripModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { TrajetEnCoursData } from '../types/trajet-en-cours.types';
import type { PassengerPosition } from './useRealtimePositions';
import type { TrajetMapFixture } from '../types/map.types';
import type { TrajetProgressionFixture } from '../types/progression-signalement.types';

import { toTrajetEnCoursData, tripToMapFixture, tripToProgressionFixture } from '../converters/trajet-en-cours.converter';
import {
  moiFixture,
} from '../fixtures/index.fixtures';
import { DEFAULT_TRIP_PREFERENCES } from '@/core/models/TripModel';
import type { TrajetEnCoursDto } from '@/server/services/TripService';
import { useMessagerie } from '../hooks/index.hooks';
import { useTrajetMap } from '../hooks/useTrajetMap';
import { useLocationEmitter } from '../hooks/useLocationEmitter';
import { useRealtimePositions } from '../hooks/useRealtimePositions';
import { haversineM } from '../fixtures/map.fixtures';
import { Language, useAppState } from '@/core/state/app_state';

const RATING_LABELS_FR: Record<number, string> = { 1: 'Mauvais', 2: 'Passable', 3: 'Correct', 4: 'Bien', 5: 'Excellent !' };
const RATING_LABELS_EN: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Okay', 4: 'Good', 5: 'Excellent!' };
const AVATAR_COLORS = ['#e03050', '#0aad6a', '#c8960a', '#0098c8', '#9333ea'];
const EMPTY_TRAJET_DATA: TrajetEnCoursData = {
  id: '',
  titre: '',
  role: 'passenger',
  conducteur: {
    id: '',
    prenom: '',
    nom: '',
    initiales: '',
    note: 0,
    nbTrajets: 0,
    nbTrajetsEnsemble: 0,
    badges: [],
    vehicule: {
      marque: '',
      modele: '',
      annee: 0,
      couleur: '',
      immatriculation: '',
      nbPlaces: 0,
    },
    estVerifie: false,
  },
  passagers: [],
  depart: { nom: '', adresse: '', coordonnees: { lat: 0, lng: 0 } },
  arrivee: { nom: '', adresse: '', coordonnees: { lat: 0, lng: 0 } },
  preferences: {
    bagagesAutorises: false,
    animauxAcceptes: false,
    fumeur: false,
    musique: false,
    niveauConversation: 'modere',
  },
  statut: {
    etat: 'confirme',
    typeDepart: 'unique',
    estRecurrent: false,
    detourMaxMin: 0,
    modePaiement: 'comptant',
    nbPlacesDisponibles: 0,
    nbPlacesTotales: 0,
    derniereMaj: new Date(0),
  },
  tarif: { prixParPassager: 0, economieVsTaxi: 0, co2EconomiseKg: 0 },
};
const EMPTY_MAP_FIXTURE: TrajetMapFixture = {
  id: 'empty',
  label: '',
  depart: { lat: 45, lng: -75 },
  arrivee: { lat: 45.00001, lng: -75.00001 },
  labelDepart: '',
  labelArrivee: '',
  vitesseMoyenneKmh: 50,
  polyline: [{ lat: 45, lng: -75 }, { lat: 45.00001, lng: -75.00001 }],
  distanceTotaleM: 1,
};
const EMPTY_PROGRESSION_FIXTURE: TrajetProgressionFixture = {
  id: 'empty',
  labelDepart: '',
  labelArrivee: '',
  dureeTotaleSecondes: 0,
  distanceTotaleKm: 0,
  etapes: [],
};

export interface UseTrajetEnCoursProps {
  tripId?: string;
}

export interface UseTrajetEnCoursReturn {
  // Données du trajet
  tripModel: TripModel | null;
  driverUser: UserModel | null;
  vehicleModel: VehicleModel | null;
  passengerUsers: UserModel[];
  role: 'driver' | 'passenger';
  trajetData: TrajetEnCoursData;
  mapFixture: TrajetMapFixture;
  activeProgressionFixture: TrajetProgressionFixture;

  // Positions temps réel
  driverPos: { lat: number; lng: number } | null;
  passengerPositions: PassengerPosition[];
  theyReallyEnd: boolean;
  myPos: { lat: number; lng: number } | null;

  // Messagerie
  moiInfo: MoiInfo;
  correspondants: Correspondant[];
  messagerie: ReturnType<typeof useMessagerie>;
  trajetMap: ReturnType<typeof useTrajetMap>;

  // État UI
  isFR: boolean;
  ratingLabels: Record<number, string>;
  showSignalement: boolean;
  showLitige: boolean;
  showCancelWarning: boolean;
  showTripCompleted: boolean;
  showFinDeTrajet: boolean;
  showOsrmError: boolean;
  eval_: EvaluationState;
  toast: { msg: string; type?: 'green' | 'red' } | null;
  alreadyReviewedIds: string[];
  dashUrl: string;
  isLoading: boolean;

  // Actions
  setShowSignalement: (v: boolean) => void;
  setShowLitige: (v: boolean) => void;
  setShowCancelWarning: (v: boolean) => void;
  setShowTripCompleted: (v: boolean) => void;
  setShowFinDeTrajet: (v: boolean) => void;
  setShowOsrmError: (v: boolean) => void;
  setEval_: React.Dispatch<React.SetStateAction<EvaluationState>>;
  showToast: (msg: string, type?: 'green' | 'red') => void;
  submitEval: () => Promise<void>;
  handleCancelTrip: () => Promise<void>;
  handleCompleteTrip: () => Promise<void>;
  handleRefreshMessages: () => void;
  handleTripCompletedOk: () => void;
}

export function useTrajetEnCours({ tripId }: UseTrajetEnCoursProps): UseTrajetEnCoursReturn {
  const appState = useAppState();
  const router = useRouter();
  const currentUser = appState.userConnected;
  const isFR = appState.lang === Language.FR;
  const RATING_LABELS = isFR ? RATING_LABELS_FR : RATING_LABELS_EN;

  // ── État API (remplace useDb) ──────────────────────────────────────────────
  const [apiData, setApiData] = useState<TrajetEnCoursDto | null>(null);
  const [driverUser, setDriverUser] = useState<UserModel | null>(null);
  const [vehicleModel, setVehicleModel] = useState<VehicleModel | null>(null);
  const [alreadyReviewedIds, setAlreadyReviewedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch tripData + conducteur + véhicule en parallèle ───────────────────
  useEffect(() => {
    if (!tripId) { setIsLoading(false); return; }

    (async () => {
      try {
        const res = await fetch(`/api/trajet-en-cours/${tripId}`);
        if (!res.ok) { setIsLoading(false); return; }
        const data = await res.json() as TrajetEnCoursDto;
        setApiData(data);

        // Fetch conducteur + véhicule en parallèle
        const [driverRes, vehicleRes] = await Promise.allSettled([
          fetch(`/api/users/${encodeURIComponent(data.trip.driverId)}`),
          fetch(`/api/vehicles/${encodeURIComponent(data.trip.vehicleId)}`),
        ]);
        if (driverRes.status === 'fulfilled' && driverRes.value.ok) {
          setDriverUser(await driverRes.value.json() as UserModel);
        }
        if (vehicleRes.status === 'fulfilled' && vehicleRes.value.ok) {
          setVehicleModel(await vehicleRes.value.json() as VehicleModel);
        }
      } catch (err) {
        console.error('[useTrajetEnCours] fetch initial', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tripId]);

  // ── Fetch avis déjà soumis (passager/conducteur déjà évalué) ─────────────
  useEffect(() => {
    if (!tripId || !currentUser?.id) return;
    fetch(`/api/reviews?tripId=${encodeURIComponent(tripId)}&reviewerId=${encodeURIComponent(currentUser.id)}`)
      .then((r) => r.ok ? r.json() : [])
      .then((rows: Array<{ revieweeId: string }>) => {
        setAlreadyReviewedIds(rows.map((r) => r.revieweeId));
      })
      .catch((err) => console.error('[useTrajetEnCours] fetchReviews', err));
  }, [tripId, currentUser?.id]);

  // ── Adaptation TrajetEnCoursDto → TripModel ───────────────────────────────
  const tripModel = useMemo((): TripModel | null => {
    if (!apiData?.trip) return null;
    const t = apiData.trip;
    // Parse polyline if it's a JSON string [[lat,lng],...]
    let polyline: [number, number][] = [];
    if (t.polyline) {
      try { polyline = JSON.parse(t.polyline) as [number, number][]; } catch { /* keep empty */ }
    }
    return {
      id: t.id,
      driverId: t.driverId,
      vehicleId: t.vehicleId,
      passengerIds: apiData.passengers.map((p) => p.userId),
      departure: {
        label: t.departureAddress,
        fullAddress: t.departureAddress,
        coordinates: { lat: t.departureLat, lng: t.departureLng },
      },
      arrival: {
        label: t.arrivalAddress,
        fullAddress: t.arrivalAddress,
        coordinates: { lat: t.arrivalLat, lng: t.arrivalLng },
      },
      waypoints: [],
      polyline,
      departureDate: t.departureDate,
      departureTime: t.departureTime,
      maxPassengers: t.maxPassengers,
      currentPassengers: t.currentPassengers,
      pricePerPassenger: t.pricePerPassenger,
      passengerPrice: t.pricePerPassenger,
      paymentMethod: (t.paymentMethod as TripModel['paymentMethod']) ?? 'cash',
      status: (t.status as TripModel['status']) ?? 'in_progress',
      departureType: 'planned',
      tripType: (t.tripType as TripModel['tripType']) ?? 'unique',
      preferences: DEFAULT_TRIP_PREFERENCES,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }, [apiData]);

  // ── Adaptation TrajetPassengerDto[] → UserModel[] ────────────────────────
  const passengerUsers = useMemo((): UserModel[] =>
    (apiData?.passengers ?? []).map((p) => ({
      id: p.userId,
      email: '',
      firstName: p.firstName,
      lastName: p.lastName,
      initials: `${p.firstName[0] ?? '?'}${p.lastName[0] ?? ''}`.toUpperCase(),
      avatarUrl: p.avatarUrl,
      role: 'passenger' as const,
      canBeDriver: false,
      profileVerified: false,
      isActive: true,
      passengerProfile: { averageRating: 4.0, totalTripsAsPassenger: 0, co2SavedKg: 0, punctualityScore: 80, noShowCount: 0 },
      preferences: { musicAccepted: true, petsAccepted: false, smokingAccepted: false, conversationLevel: 'moderate' as const },
      goScore: 250,
      badgeIds: [],
      createdAt: '',
      updatedAt: '',
    } as UserModel)),
  [apiData]);

  const role = useMemo(
    () => (currentUser?.id === tripModel?.driverId ? ('driver' as const) : ('passenger' as const)),
    [currentUser, tripModel],
  );

  // ── Données UI ─────────────────────────────────────────────────────────────
  const trajetData = useMemo(() => {
    if (!tripModel || !driverUser || !vehicleModel) return EMPTY_TRAJET_DATA;
    return toTrajetEnCoursData(tripModel, role, driverUser, vehicleModel, passengerUsers);
  }, [tripModel, role, driverUser, vehicleModel, passengerUsers]);

  const mapFixture = useMemo(
    () => (tripModel ? (tripToMapFixture(tripModel) ?? EMPTY_MAP_FIXTURE) : EMPTY_MAP_FIXTURE),
    [tripModel],
  );

  const activeProgressionFixture = useMemo(
    () => (tripModel ? tripToProgressionFixture(tripModel) : EMPTY_PROGRESSION_FIXTURE),
    [tripModel],
  );

  // ── Positions temps réel ──────────────────────────────────────────────────
  useLocationEmitter(currentUser?.id, tripId, !!tripId);
  const { driverPos, passengerPositions, theyReallyEnd } = useRealtimePositions(tripId);

  const myPos = useMemo(() => {
    if (!currentUser?.id) return null;
    if (role === 'driver') {
      return driverPos ?? null;
    }
    return passengerPositions.find((p) => p.userId === currentUser.id)?.pos ?? null;
  }, [role, currentUser?.id, driverPos, passengerPositions]);

  // ── Sync position GPS réelle → état trajetMap (progression + ETA) ──────────
  const trajetMap = useTrajetMap(mapFixture);

  useEffect(() => {
    if (!driverPos) return;
    const pts = trajetMap.state.fixture.polyline;
    if (pts.length < 2) return;
    const { lat, lng } = driverPos;

    let minD = Infinity; let splitIdx = 0;
    for (let i = 0; i < pts.length; i++) {
      const dx = (pts[i].lng - lng) * 111000 * Math.cos(lat * Math.PI / 180);
      const dy = (pts[i].lat - lat) * 111000;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minD) { minD = d; splitIdx = i; }
    }

    let distParcourue = 0;
    for (let i = 0; i < splitIdx; i++) {
      distParcourue += haversineM(pts[i], pts[i + 1]);
    }

    trajetMap.updateFromSocket({ tripId: tripId ?? '', lat, lng, heading: 0, speed: 0, timestamp: Date.now(), distanceParcourue: distParcourue });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverPos]);

  // ── Messagerie ─────────────────────────────────────────────────────────────
  const moiInfo = useMemo((): MoiInfo => ({
    id: currentUser?.id ?? moiFixture.id,
    prenom: currentUser?.firstName ?? moiFixture.prenom,
    nom: currentUser?.lastName ?? moiFixture.nom,
    initiales: (currentUser?.firstName?.[0] ?? '') + (currentUser?.lastName?.[0] ?? '') || moiFixture.initiales,
    couleurAvatar: '#1a5cb0',
  }), [currentUser]);

  const correspondants = useMemo((): Correspondant[] => {
    if (role === 'driver') {
      return passengerUsers.map((p, i) => ({
        id: p.id, prenom: p.firstName, nom: p.lastName,
        initiales: p.initials, couleurAvatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
        role: 'passenger' as const, estEnLigne: false, photo: p.avatarUrl ?? undefined,
      }));
    }
    if (!driverUser) return [];
    return [{
      id: driverUser.id, prenom: driverUser.firstName, nom: driverUser.lastName,
      initiales: driverUser.initials, couleurAvatar: '#08316e',
      role: 'driver' as const, estEnLigne: false, photo: driverUser.avatarUrl ?? undefined,
    }];
  }, [role, passengerUsers, driverUser]);

  const messagerie = useMessagerie(moiInfo.id, correspondants);

  // ── Overlays & modals ──────────────────────────────────────────────────────
  const [showSignalement, setShowSignalement] = useState(false);
  const [showLitige, setShowLitige] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showTripCompleted, setShowTripCompleted] = useState(false);
  const [showFinDeTrajet, setShowFinDeTrajet] = useState(false);
  const [showOsrmError, setShowOsrmError] = useState(false);
  const completionFlowStarted = useRef(false);

  const [eval_, setEval_] = useState<EvaluationState>({ note: 0, commentaire: '', estSoumis: false, passagerSelectionne: undefined });
  const [toast, setToast] = useState<{ msg: string; type?: 'green' | 'red' } | null>(null);

  const showToast = useCallback((msg: string, type?: 'green' | 'red') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const submitEval = useCallback(async () => {
    if (!eval_.note || eval_.commentaire.trim().length < 10) {
      showToast(isFR ? '⭐ Note et commentaire requis (10 car. min.).' : '⭐ Rating and comment required (min 10 chars).'); return;
    }
    if (role === 'driver' && !eval_.passagerSelectionne) {
      showToast(isFR ? 'Sélectionnez un passager à évaluer.' : 'Select a passenger to rate.'); return;
    }

    const revieweeId = role === 'driver' ? eval_.passagerSelectionne! : (driverUser?.id ?? '');
    const revieweeRole = role === 'driver' ? 'passenger' : 'driver';
    // reservationId récupéré depuis les passagers de l'API
    const passengerEntry = apiData?.passengers.find((p) => p.userId === revieweeId);
    const reservationId = passengerEntry?.reservationId ?? '';

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          reservationId,
          reviewerId: currentUser?.id ?? '',
          revieweeId,
          revieweeRole,
          rating: eval_.note,
          comment: eval_.commentaire.trim(),
          tags: [],
        }),
      });

      setEval_((p) => ({ ...p, estSoumis: true }));
      showToast(isFR ? '✓ Évaluation envoyée — Merci !' : '✓ Review submitted — Thank you!', 'green');

      const dashUrl = role === 'driver'
        ? `/driver/${currentUser?.id}`
        : `/passenger/${currentUser?.id}`;
      setTimeout(() => router.replace(dashUrl), 1200);
    } catch (err) {
      console.error('[useTrajetEnCours] submitEvaluation', err);
      showToast(isFR ? 'Erreur lors de l\'envoi.' : 'Submission error.', 'red');
    }
  }, [eval_, role, driverUser?.id, apiData, tripId, currentUser?.id, isFR, showToast, router]);

  // ── URL tableau de bord ────────────────────────────────────────────────────
  const dashUrl = role === 'driver'
    ? `/driver/${currentUser?.id}`
    : `/passenger/${currentUser?.id}`;

  // ── Garde de page : trajet terminé + déjà évalué → redirect immédiat ──────
  const { passagers } = trajetData;
  const alreadyFullyEvaluated = useMemo(() => {
    if (role === 'passenger') return alreadyReviewedIds.length > 0;
    return passagers.length > 0 && passagers.every((p) => alreadyReviewedIds.includes(p.id));
  }, [role, alreadyReviewedIds, passagers]);

  useEffect(() => {
    if (isLoading || !tripModel) return;
    if (tripModel.status !== 'completed') return;
    if (completionFlowStarted.current) return;
    completionFlowStarted.current = true;

    if (alreadyFullyEvaluated) {
      router.replace(dashUrl);
    } else {
      setShowTripCompleted(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, tripModel?.status]);

  // ── Fin de trajet via SSE (theyReallyEnd) ─────────────────────────────────
  useEffect(() => {
    if (!theyReallyEnd || completionFlowStarted.current) return;
    completionFlowStarted.current = true;
    setShowFinDeTrajet(false);

    if (alreadyFullyEvaluated) {
      router.replace(dashUrl);
    } else {
      setTimeout(() => setShowTripCompleted(true), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theyReallyEnd]);

  const handleTripCompletedOk = useCallback(() => {
    setShowTripCompleted(false);
    setShowFinDeTrajet(true);
  }, []);

  // ── Annulation du trajet ───────────────────────────────────────────────────
  const handleCancelTrip = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        showToast(isFR ? 'Trajet annulé. Des pénalités ont été appliquées.' : 'Trip cancelled. Penalties have been applied.', 'red');
        setTimeout(() => router.back(), 2500);
      } else {
        showToast(isFR ? "Erreur lors de l'annulation." : 'Error cancelling trip.', 'red');
      }
    } catch (err) {
      console.error('[useTrajetEnCours] handleCancelTrip', err);
      showToast(isFR ? "Erreur réseau." : 'Network error.', 'red');
    }
    setShowCancelWarning(false);
  }, [tripId, isFR, showToast, router]);

  const handleCompleteTrip = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/complete`, {
        method: 'PATCH',
      });
      if (res.ok) {
        completionFlowStarted.current = true;
        setShowFinDeTrajet(false);
        setShowTripCompleted(true);
        showToast(isFR ? 'Trajet termine avec succes.' : 'Trip completed successfully.', 'green');
      } else {
        showToast(isFR ? 'Erreur lors de la fin du trajet.' : 'Error while completing trip.', 'red');
      }
    } catch (err) {
      console.error('[useTrajetEnCours] handleCompleteTrip', err);
      showToast(isFR ? 'Erreur reseau.' : 'Network error.', 'red');
    }
  }, [tripId, isFR, showToast]);

  // ── Rafraîchissement de la messagerie ─────────────────────────────────────
  const handleRefreshMessages = useCallback(() => {
    void messagerie.refresh();
  }, [messagerie]);

  return {
    tripModel, driverUser, vehicleModel, passengerUsers, role, trajetData, mapFixture, activeProgressionFixture,
    driverPos, passengerPositions, theyReallyEnd, myPos,
    moiInfo, correspondants, messagerie, trajetMap,
    isFR, ratingLabels: RATING_LABELS,
    showSignalement, showLitige, showCancelWarning, showTripCompleted, showFinDeTrajet, showOsrmError,
    eval_, toast, alreadyReviewedIds, dashUrl, isLoading,
    setShowSignalement, setShowLitige, setShowCancelWarning, setShowTripCompleted, setShowFinDeTrajet, setShowOsrmError,
    setEval_, showToast, submitEval, handleCancelTrip, handleCompleteTrip, handleRefreshMessages, handleTripCompletedOk,
  };
}
