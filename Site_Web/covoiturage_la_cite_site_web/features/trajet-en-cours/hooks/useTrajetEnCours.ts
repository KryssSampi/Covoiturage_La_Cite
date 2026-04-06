// ═══════════════════════════════════════════════════════════════════════
// Hook useTrajetEnCours — Logique de récupération des données et du polling
// ═══════════════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { EvaluationState } from '../types/trajet-en-cours.types';
import type { Correspondant, MoiInfo } from '../types/messagerie.types';
import type { UserModel } from '@/core/models/UserModel';
import type { TrajetEnCoursData } from '../types/trajet-en-cours.types';
import type { PassengerPosition } from './useRealtimePositions';
import type { TrajetMapFixture } from '../types/map.types';
import type { TrajetProgressionFixture } from '../types/progression-signalement.types';

import { useDb } from '@/core/context/db.context';
import { toTrajetEnCoursData, tripToMapFixture, tripToProgressionFixture } from '../converters/trajet-en-cours.converter';
import {
  trajetFixture,
  moiFixture,
  progressionFixture,
} from '../fixtures/index.fixtures';
import { useMessagerie } from '../hooks/index.hooks';
import { useTrajetMap } from '../hooks/useTrajetMap';
import { useLocationEmitter } from '../hooks/useLocationEmitter';
import { useRealtimePositions } from '../hooks/useRealtimePositions';
import { fixtureMapPrincipale, haversineM } from '../fixtures/map.fixtures';
import { Language, useAppState } from '@/core/state/app_state';

const RATING_LABELS_FR: Record<number, string> = { 1: 'Mauvais', 2: 'Passable', 3: 'Correct', 4: 'Bien', 5: 'Excellent !' };
const RATING_LABELS_EN: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Okay', 4: 'Good', 5: 'Excellent!' };
const AVATAR_COLORS = ['#e03050', '#0aad6a', '#c8960a', '#0098c8', '#9333ea'];

export interface UseTrajetEnCoursProps {
  tripId?: string;
}

export interface UseTrajetEnCoursReturn {
  // Données du trajet
  tripModel: ReturnType<typeof useDb>['trips'][number] | null;
  driverUser: UserModel | null;
  vehicleModel: ReturnType<typeof useDb>['vehicles'][number] | null;
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
  handleRefreshMessages: () => void;
  handleTripCompletedOk: () => void;
}

export function useTrajetEnCours({ tripId }: UseTrajetEnCoursProps): UseTrajetEnCoursReturn {
  const appState = useAppState();
  const router = useRouter();
  const { trips, users, vehicles, reservations, reviews, isLoading } = useDb();
  const currentUser = appState.userConnected;
  const isFR = appState.lang === Language.FR;
  const RATING_LABELS = isFR ? RATING_LABELS_FR : RATING_LABELS_EN;

  // ── Données du trajet ──────────────────────────────────────────────────────
  const tripModel = useMemo(
    () => (tripId ? trips.find((t) => t.id === tripId) ?? null : null),
    [trips, tripId],
  );
  const driverUser = useMemo(
    () => (tripModel ? users.find((u) => u.id === tripModel.driverId) ?? null : null),
    [tripModel, users],
  );
  const vehicleModel = useMemo(
    () => (tripModel ? vehicles.find((v) => v.id === tripModel.vehicleId) ?? null : null),
    [tripModel, vehicles],
  );
  const passengerUsers = useMemo(
    (): UserModel[] =>
      tripModel
        ? tripModel.passengerIds.map((pid) => users.find((u) => u.id === pid)).filter((u): u is UserModel => !!u)
        : [],
    [tripModel, users],
  );

  const role = useMemo(
    () => (currentUser?.id === tripModel?.driverId ? ('driver' as const) : ('passenger' as const)),
    [currentUser, tripModel],
  );

  // ── Données UI ─────────────────────────────────────────────────────────────
  const trajetData = useMemo(() => {
    if (!tripModel || !driverUser || !vehicleModel) return trajetFixture;
    return toTrajetEnCoursData(tripModel, role, driverUser, vehicleModel, passengerUsers);
  }, [tripModel, role, driverUser, vehicleModel, passengerUsers]);

  const mapFixture = useMemo(
    () => (tripModel ? (tripToMapFixture(tripModel) ?? fixtureMapPrincipale) : fixtureMapPrincipale),
    [tripModel],
  );

  const activeProgressionFixture = useMemo(
    () => (tripModel ? tripToProgressionFixture(tripModel) : progressionFixture),
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
  const coreUser = useMemo(
    () => (currentUser ? users.find((u) => u.id === currentUser.id) ?? null : null),
    [currentUser, users],
  );
  const moiInfo = useMemo((): MoiInfo => ({
    id: coreUser?.id ?? moiFixture.id,
    prenom: coreUser?.firstName ?? moiFixture.prenom,
    nom: coreUser?.lastName ?? moiFixture.nom,
    initiales: coreUser?.initials ?? moiFixture.initiales,
    couleurAvatar: '#1a5cb0',
  }), [coreUser]);

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

  // IDs des passagers déjà évalués
  const alreadyReviewedIds = useMemo(() => {
    if (!currentUser?.id || !tripId) return [];
    return reviews
      .filter((r) => r.tripId === tripId && r.reviewerId === currentUser.id)
      .map((r) => r.revieweeId);
  }, [reviews, currentUser?.id, tripId]);

  const submitEval = useCallback(async () => {
    if (!eval_.note || eval_.commentaire.trim().length < 10) {
      showToast(isFR ? '⭐ Note et commentaire requis (10 car. min.).' : '⭐ Rating and comment required (min 10 chars).'); return;
    }
    if (role === 'driver' && !eval_.passagerSelectionne) {
      showToast(isFR ? 'Sélectionnez un passager à évaluer.' : 'Select a passenger to rate.'); return;
    }

    const revieweeId = role === 'driver' ? eval_.passagerSelectionne! : (driverUser?.id ?? '');
    const revieweeRole = role === 'driver' ? 'passenger' : 'driver';
    const reservation = reservations.find(
      (r) => r.tripId === tripId && (role === 'driver' ? r.passengerId === revieweeId : r.passengerId === currentUser?.id),
    );

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          reservationId: reservation?.id ?? '',
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
    } catch {
      showToast(isFR ? 'Erreur lors de l\'envoi.' : 'Submission error.', 'red');
    }
  }, [eval_, role, driverUser?.id, reservations, tripId, currentUser?.id, isFR, showToast, router]);

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
    } catch {
      showToast(isFR ? "Erreur réseau." : 'Network error.', 'red');
    }
    setShowCancelWarning(false);
  }, [tripId, isFR, showToast, router]);

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
    setEval_, showToast, submitEval, handleCancelTrip, handleRefreshMessages, handleTripCompletedOk,
  };
}
