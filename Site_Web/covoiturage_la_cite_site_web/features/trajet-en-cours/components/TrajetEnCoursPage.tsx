'use client';
// ═══════════════════════════════════════════════════════════════════════
// Composant principal « Trajet en cours »
// ═══════════════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaPhone, FaBan } from 'react-icons/fa';

import { EvaluationState } from '../types/trajet-en-cours.types';
import type { Correspondant, MoiInfo } from '../types/messagerie.types';
import type { UserModel } from '@/core/models/UserModel';

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

import { ProgressionSection } from './ProgressionMessagerie';
import { Messagerie } from './ProgressionMessagerie';
import { SignalementOverlay } from './SignalementOverlay';
import { LitigeOverlay } from './LitigeOverlay';
import { TripHeaderCard } from '@/shared/components/trip-header-card/TripHeaderCard';
import { TrajetMap } from './TrajetMap';
import { TripInfoPanel } from './TripInfoPanel';
import { PassengerList } from './PassengerList';
import { ActionBar } from './ActionBar';
import { CancelWarningModal, TripEndEvalModal, OsrmErrorModal, TripCompletedModal } from './TripModals';
import { Language, useAppState } from '@/core/state/app_state';
import { C } from './trajet-page-styles';

const RATING_LABELS_FR: Record<number, string> = { 1:'Mauvais', 2:'Passable', 3:'Correct', 4:'Bien', 5:'Excellent !' };
const RATING_LABELS_EN: Record<number, string> = { 1:'Poor',    2:'Fair',     3:'Okay',    4:'Good', 5:'Excellent!' };
const AVATAR_COLORS = ['#e03050', '#0aad6a', '#c8960a', '#0098c8', '#9333ea'];

export default function TrajetEnCoursPage({ tripId }: { tripId?: string }) {
  const appState    = useAppState();
  const router      = useRouter();
  const { trips, users, vehicles, reservations, reviews, isLoading } = useDb();
  const currentUser = appState.userConnected;

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

  // Fixture de progression construite depuis les données réelles du trajet
  const activeProgressionFixture = useMemo(
    () => (tripModel ? tripToProgressionFixture(tripModel) : progressionFixture),
    [tripModel],
  );

  // ── Positions temps réel ──────────────────────────────────────────────────
  // Émission GPS de l'utilisateur connecté vers le serveur
  useLocationEmitter(currentUser?.id, tripId, !!tripId);

  // Réception SSE des positions conducteur + passagers
  const { driverPos, passengerPositions, theyReallyEnd } = useRealtimePositions(tripId);

  // Position "Vous" : ma propre position dans la liste SSE
  const myPos = useMemo(() => {
    if (!currentUser?.id) return null;
    if (role === 'driver') {
      // Le conducteur est le driverPos lui-même
      return driverPos ?? null;
    }
    return passengerPositions.find((p) => p.userId === currentUser.id)?.pos ?? null;
  }, [role, currentUser?.id, driverPos, passengerPositions]);

  // ── Sync position GPS réelle → état trajetMap (progression + ETA) ──────────
  // Quand driverPos arrive via SSE, on calcule la distance cumulée sur la
  // polyline OSRM et on met à jour trajetMap.state via updateFromSocket,
  // ce qui alimente la barre de progression et les waypoints.
  useEffect(() => {
    if (!driverPos) return;
    const pts = trajetMap.state.fixture.polyline;
    if (pts.length < 2) return;
    const { lat, lng } = driverPos;

    // Trouver le point de la polyline le plus proche du conducteur
    let minD = Infinity; let splitIdx = 0;
    for (let i = 0; i < pts.length; i++) {
      const dx = (pts[i].lng - lng) * 111000 * Math.cos(lat * Math.PI / 180);
      const dy = (pts[i].lat - lat) * 111000;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < minD) { minD = d; splitIdx = i; }
    }

    // Distance cumulée du départ jusqu'au point le plus proche
    let distParcourue = 0;
    for (let i = 0; i < splitIdx; i++) {
      distParcourue += haversineM(pts[i], pts[i + 1]);
    }

    trajetMap.updateFromSocket({ tripId: tripId ?? '', lat, lng, heading: 0, speed: 0, timestamp: Date.now(), distanceParcourue: distParcourue });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverPos]);

  // Redirection auto si le trajet est vraiment terminé
  useEffect(() => {
    if (theyReallyEnd && tripId) {
      setTimeout(() => router.replace(`/driver/${tripModel?.driverId}`), 3000);
    }
  }, [theyReallyEnd, tripId, router, tripModel?.driverId]);

  // ── Messagerie ─────────────────────────────────────────────────────────────
  const coreUser = useMemo(
    () => (currentUser ? users.find((u) => u.id === currentUser.id) ?? null : null),
    [currentUser, users],
  );
  const moiInfo = useMemo((): MoiInfo => ({
    id:            coreUser?.id ?? moiFixture.id,
    prenom:        coreUser?.firstName ?? moiFixture.prenom,
    nom:           coreUser?.lastName ?? moiFixture.nom,
    initiales:     coreUser?.initials ?? moiFixture.initiales,
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

  const messagerie = useMessagerie(moiInfo.id, correspondants, tripId);
  const trajetMap  = useTrajetMap(mapFixture);

  const { conducteur, depart, arrivee, preferences, statut, tarif, passagers, titre, id, dateDepart, heureDepart } = trajetData;
  const isFR = appState.lang === Language.FR;
  const RATING_LABELS = isFR ? RATING_LABELS_FR : RATING_LABELS_EN;

  // ── Overlays & modals ──────────────────────────────────────────────────────
  const [showSignalement,   setShowSignalement]   = useState(false);
  const [showLitige,        setShowLitige]         = useState(false);
  const [showCancelWarning, setShowCancelWarning]  = useState(false);
  const [showTripCompleted, setShowTripCompleted]  = useState(false);
  const [showFinDeTrajet,   setShowFinDeTrajet]    = useState(false);
  const [showOsrmError,     setShowOsrmError]      = useState(false);
  const completionFlowStarted = useRef(false);

  const [eval_, setEval_] = useState<EvaluationState>({ note: 0, commentaire: '', estSoumis: false, passagerSelectionne: undefined });
  const [toast, setToast] = useState<{ msg: string; type?: 'green' | 'red' } | null>(null);

  const showToast = useCallback((msg: string, type?: 'green' | 'red') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // IDs des passagers déjà évalués par le conducteur courant pour ce trajet
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

      // Mettre à jour passengerRating sur la réservation (conducteur évaluant passager)
      if (role === 'driver' && reservation?.id) {
        const allRes = await fetch('/api/db/reservations').then((r) => r.json()) as Record<string, unknown>[];
        const updated = allRes.map((r) =>
          r.id === reservation.id ? { ...r, passengerRating: eval_.note } : r,
        );
        await fetch('/api/db/reservations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      }

      setEval_((p) => ({ ...p, estSoumis: true }));
      showToast(isFR ? '✓ Évaluation envoyée — Merci !' : '✓ Review submitted — Thank you!', 'green');

      // Redirection vers le dashboard après soumission de l'évaluation
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

  // Quand l'utilisateur clique OK sur TripCompletedModal → ouvre l'évaluation
  const handleTripCompletedOk = useCallback(() => {
    setShowTripCompleted(false);
    setShowFinDeTrajet(true);
  }, []);

  // ── Annulation du trajet ───────────────────────────────────────────────────
  const handleCancelTrip = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'cancel' }),
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

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: C.p, opacity: 0.6 }}>
          {isFR ? 'Chargement du trajet…' : 'Loading trip…'}
        </div>
      </div>
    );
  }

  if (tripId && !tripModel) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: C.red }}>
          {isFR ? 'Trajet introuvable.' : 'Trip not found.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: C.text }}>

      {/* ── Carte résumé conducteur ── */}
      <TripHeaderCard
        title={titre}
        tripId={id}
        roleLabel={role === 'driver' ? (isFR ? 'Vue conducteur' : 'Driver view') : (isFR ? 'Vue passager' : 'Passenger view')}
        statusBadge={{
          label: isFR ? 'En cours…' : 'In progress…',
          color: '#0aad6a', bgColor: 'rgba(10,173,106,0.1)', borderColor: 'rgba(10,173,106,.25)', pulse: true,
        }}
        driver={{
          firstName: conducteur.prenom, lastName: conducteur.nom, initials: conducteur.initiales,
          rating: conducteur.note, tripCount: conducteur.nbTrajets, isVerified: conducteur.estVerifie,
          badges: conducteur.badges.map(b => ({ id: b.id, icon: b.icone, label: b.label })),
        }}
        vehicle={{
          label: `${conducteur.vehicule.marque} ${conducteur.vehicule.modele}`,
          color: conducteur.vehicule.couleur, plate: conducteur.vehicule.immatriculation,
        }}
        price={tarif.prixParPassager}
        departureDate={dateDepart}
        departureTime={heureDepart}
        availableSeats={statut.nbPlacesDisponibles}
        className="rounded-none rounded-b-2xl shadow-[0_4px_18px_rgba(8,49,110,0.09)]"
        actions={
          role === 'driver' ? (
            <div className="flex justify-end w-full">
              <button
                onClick={() => setShowCancelWarning(true)}
                className="flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-xl text-center justify-center w-80 h-12 text-white cursor-pointer"
                style={{ background: '#e03050' }}
              >
                <FaBan size={16} /> {isFR ? 'Annuler' : 'Cancel'}
              </button>
            </div>
          ) : (
            <>
              <a
                href={`tel:${conducteur.telephone ?? ''}`}
                onClick={() => showToast(isFR ? `Appel en cours vers ${conducteur.prenom}…` : `Calling ${conducteur.prenom}…`, 'green')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white cursor-pointer no-underline"
                style={{ background: '#0aad6a' }}
              >
                <FaPhone size={13} /> {isFR ? 'Appeler le conducteur' : 'Call driver'}
              </a>
              <button
                onClick={() => setShowCancelWarning(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
                style={{ background: '#e03050' }}
              >
                <FaBan size={13} /> {isFR ? 'Annuler le trajet' : 'Cancel trip'}
              </button>
            </>
          )
        }
      />

      {/* ── Contenu principal ── */}
      <div style={{ width: '100%', padding: '22px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Carte + progression */}
        <div style={{ position: 'relative', marginBottom: 40 , zIndex: 1 }}>
          <TrajetMap
            height="400px"
            role={role}
            trajetHook={trajetMap}
            fixture={mapFixture}
            driverPos={driverPos}
            myPos={myPos}
            departureCoords={tripModel?.departure.coordinates}
            arrivalCoords={tripModel?.arrival.coordinates}
          />
          <div style={{ position: 'relative', marginTop: -20, zIndex: 10, padding: '0 16px' }}>
            <ProgressionSection
              fixture={activeProgressionFixture}
              mapState={{
                pourcentageComplete:  trajetMap.state.pourcentageComplete,
                distanceParcourue:    trajetMap.state.distanceParcourue,
                distanceTotaleM:      trajetMap.state.fixture.distanceTotaleM,
                estTermine:           trajetMap.state.estTermine,
                labelDepart:          trajetMap.state.fixture.labelDepart,
                labelArrivee:         trajetMap.state.fixture.labelArrivee,
                vitesseMoyenneKmh:    trajetMap.state.fixture.vitesseMoyenneKmh,
              }}
            />
          </div>
        </div>

        {/* Grille 3 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16, alignItems: 'stretch' }}>
          <TripInfoPanel
            depart={depart} arrivee={arrivee} preferences={preferences}
            statut={statut} conducteur={conducteur} tarif={tarif} isFR={isFR}
          >
            {role === 'driver' && passagers.length > 0 && (
              <PassengerList passagers={passagers} isFR={isFR} />
            )}
          </TripInfoPanel>

          {/* Messagerie */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Messagerie
              roleMoi={role}
              correspondants={correspondants}
              moi={moiInfo}
              conversations={messagerie.conversations}
              activeConversation={messagerie.activeConversation}
              messagesActifs={messagerie.messagesActifs}
              unreadCounts={messagerie.unreadCounts}
              onSendMessage={messagerie.sendMessage}
              onSetActiveCorrespondant={messagerie.setActiveCorrespondant}
              onBroadcast={messagerie.broadcastMessage}
              onRefresh={handleRefreshMessages}
            />
          </div>
        </div>

        {/* ActionBar */}
        <ActionBar
          role={role}
          conducteur={conducteur} depart={depart} arrivee={arrivee}
          passagers={passagers} alreadyReviewedIds={alreadyReviewedIds}
          eval_={eval_} setEval_={setEval_} onSubmitEval={submitEval}
          ratingLabels={RATING_LABELS} isFR={isFR}
          onShowSignalement={() => setShowSignalement(true)}
          onShowLitige={() => setShowLitige(true)}
        />
      </div>

      {/* Overlays */}
      {showSignalement && (
        <SignalementOverlay
          isOpen={showSignalement} trajetId={id} trajetTitre={titre}
          role={role}
          cibleNomParDefaut={
            role === 'driver'
              ? (passagers[0] ? `${passagers[0].prenom} ${passagers[0].nom}` : '')
              : `${conducteur.prenom} ${conducteur.nom}`
          }
          cibleRoleParDefaut={role === 'driver' ? 'passager' : 'conducteur'}
          onClose={() => setShowSignalement(false)}
        />
      )}
      {showLitige && (
        <LitigeOverlay
          isOpen={showLitige} passagers={passagers}
          onClose={() => setShowLitige(false)}
          onSubmit={(data) => {
            const nom = passagers.find(p => p.id === data.accuseId)?.prenom ?? 'inconnu';
            showToast(isFR ? `Litige déclaré contre ${nom}` : `Dispute filed against ${nom}`, 'red');
          }}
        />
      )}
      {showCancelWarning && (
        <CancelWarningModal
          isFR={isFR}
          onClose={() => setShowCancelWarning(false)}
          onConfirm={handleCancelTrip}
        />
      )}
      {showTripCompleted && (
        <TripCompletedModal isFR={isFR} role={role} onOk={handleTripCompletedOk} />
      )}
      {showFinDeTrajet && (
        <TripEndEvalModal
          isFR={isFR}
          role={role}
          passagers={passagers}
          alreadyReviewedIds={alreadyReviewedIds}
          eval_={eval_} setEval_={setEval_} ratingLabels={RATING_LABELS}
          canDismiss={false}
          onClose={() => setShowFinDeTrajet(false)}
          onSubmit={() => { void submitEval(); }}
        />
      )}
      {showOsrmError && (
        <OsrmErrorModal isFR={isFR} onClose={() => setShowOsrmError(false)} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 22px', borderRadius: 12,
          background: toast.type === 'green' ? C.green : toast.type === 'red' ? C.red : C.p,
          color: '#fff', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,.18)', animation: 'slideUp .3s ease',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
