'use client';
// ═══════════════════════════════════════════════════════════════════════
// Composant principal « Trajet en cours »
// Assemble ProgressionSection · Messagerie · SignalementOverlay
// ═══════════════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect } from 'react';
import { FaPhone, FaBan } from 'react-icons/fa';



// ── Types ────────────────────────────────────────────────────────────
import { EvaluationState } from '../types/trajet-en-cours.types';
import type { Correspondant, MoiInfo } from '../types/messagerie.types';
import type { UserModel } from '@/core/models/UserModel';

// ── DB + Converter ────────────────────────────────────────────────────
import { useDb } from '@/core/context/db.context';
import { toTrajetEnCoursData, tripToMapFixture } from '../converters/trajet-en-cours.converter';

// ── Fixtures de démo (messagerie + progression) ──────────────────────
import {
  trajetFixture,
  moiFixture,
  progressionFixture,
} from '../fixtures/index.fixtures';

// ── Hooks ─────────────────────────────────────────────────────────────
import { useMessagerie } from '../hooks/index.hooks';
import { useTrajetMap } from '../hooks/useTrajetMap';
import { fixtureMapPrincipale } from '../fixtures/map.fixtures';

// ── Composants ────────────────────────────────────────────────────────
import { ProgressionSection } from './ProgressionMessagerie';
import { Messagerie } from './ProgressionMessagerie';
import { SignalementOverlay } from './SignalementOverlay';
import { LitigeOverlay } from './LitigeOverlay';
import { TripHeaderCard } from '@/shared/components/trip-header-card/TripHeaderCard';
import { TrajetMap } from './TrajetMap';
import { TripInfoPanel } from './TripInfoPanel';
import { PassengerList } from './PassengerList';
import { ActionBar } from './ActionBar';
import { CancelWarningModal, TripEndEvalModal, OsrmErrorModal } from './TripModals';
import { Language, useAppState } from '@/core/state/app_state';

// ── Palette de couleurs et styles partagés ───────────────────────────
import { C } from './trajet-page-styles';

// Labels pour les notes d'évaluation
const RATING_LABELS_FR: Record<number, string> = {
  1: 'Mauvais',
  2: 'Passable',
  3: 'Correct',
  4: 'Bien',
  5: 'Excellent !',
};
const RATING_LABELS_EN: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent!',
};

// ════════════════════════════════════════════════════════════════════
// Couleurs d'avatar pour les correspondants de messagerie
const AVATAR_COLORS = ['#e03050', '#0aad6a', '#c8960a', '#0098c8', '#9333ea'];

export default function TrajetEnCoursPage({ tripId }: { tripId?: string }) {
  // ── Données réelles depuis la DB ──────────────────────────────────────
  const appState = useAppState();
  const { trips, users, vehicles } = useDb();
  const currentUser = appState.userConnected;

  // Recherche du trajet par tripId
  const tripModel = useMemo(
    () => (tripId ? trips.find((t) => t.id === tripId) ?? null : null),
    [trips, tripId]
  );

  const driverUser = useMemo(
    () => (tripModel ? users.find((u) => u.id === tripModel.driverId) ?? null : null),
    [tripModel, users]
  );

  const vehicleModel = useMemo(
    () => (tripModel ? vehicles.find((v) => v.id === tripModel.vehicleId) ?? null : null),
    [tripModel, vehicles]
  );

  const passengerUsers = useMemo(
    (): UserModel[] =>
      tripModel
        ? tripModel.passengerIds
            .map((pid) => users.find((u) => u.id === pid))
            .filter((u): u is UserModel => !!u)
        : [],
    [tripModel, users]
  );

  // Déterminer le rôle de l'utilisateur connectsur ce trajet
  const role = useMemo(
    () =>
      currentUser?.id === tripModel?.driverId
        ? ('driver' as const)
        : ('passenger' as const),
    [currentUser, tripModel]
  );

  // Données UI du trajet — fallback sur trajetFixture si données manquantes
  const trajetData = useMemo(() => {
    if (!tripModel || !driverUser || !vehicleModel) return trajetFixture;
    return toTrajetEnCoursData(tripModel, role, driverUser, vehicleModel, passengerUsers);
  }, [tripModel, role, driverUser, vehicleModel, passengerUsers]);

  // Fixture carte — fallback sur fixtureMapPrincipale si polyline manquante
  const mapFixture = useMemo(
    () => (tripModel ? (tripToMapFixture(tripModel) ?? fixtureMapPrincipale) : fixtureMapPrincipale),
    [tripModel]
  );

  // Correspondants pour la messagerie construits depuis les UserModels réels
  const correspondants = useMemo((): Correspondant[] => {
    if (role === 'driver') {
      return passengerUsers.map((p, i) => ({
        id: p.id,
        prenom: p.firstName,
        nom: p.lastName,
        initiales: p.initials,
        couleurAvatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
        role: 'passenger' as const,
        estEnLigne: false,
        photo: p.avatarUrl ?? undefined,
      }));
    }
    if (!driverUser) return [];
    return [{
      id: driverUser.id,
      prenom: driverUser.firstName,
      nom: driverUser.lastName,
      initiales: driverUser.initials,
      couleurAvatar: '#08316e',
      role: 'driver' as const,
      estEnLigne: false,
      photo: driverUser.avatarUrl ?? undefined,
    }];
  }, [role, passengerUsers, driverUser]);

  // User core (firstName/lastName) identifié par l'id de session
  const coreUser = useMemo(
    () => (currentUser ? users.find((u) => u.id === currentUser.id) ?? null : null),
    [currentUser, users]
  );

  // Infos de l'utilisateur connecté pour la messagerie
  const moiInfo = useMemo((): MoiInfo => ({
    id: coreUser?.id ?? moiFixture.id,
    prenom: coreUser?.firstName ?? moiFixture.prenom,
    nom: coreUser?.lastName ?? moiFixture.nom,
    initiales: coreUser?.initials ?? moiFixture.initiales,
    couleurAvatar: '#1a5cb0',
  }), [coreUser]);

  const { conducteur, depart, arrivee, preferences, statut, tarif, passagers, titre, id, dateDepart, heureDepart } = trajetData;

  const isFR = appState.lang === Language.FR;
  const RATING_LABELS = isFR ? RATING_LABELS_FR : RATING_LABELS_EN;

  // ── Messagerie hook (nouveau modèle Conversation) ──
  const messagerie = useMessagerie(moiInfo.id, correspondants);

  // ── Hook carte partagé : état unique pour TrajetMap + ProgressionSection ──
  const trajetMap = useTrajetMap(mapFixture);
  const [showSignalement, setShowSignalement] = useState(false);
  // ── Litige ──
  const [showLitige, setShowLitige] = useState(false);

  // ── Annulation (popup avertissement) ──
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // ── Fin de trajet détectée (popup évaluation) ──
  const [showFinDeTrajet, setShowFinDeTrajet] = useState(false);

  // ── Erreur OSRM (popup avertissement réseau) ──
  const [showOsrmError, setShowOsrmError] = useState(false);

  // ── Évaluation ──
  const [eval_, setEval_] = useState<EvaluationState>({ note: 0, commentaire: '', estSoumis: false });

  // ── Toast de notification ──
  const [toast, setToast] = useState<{ msg: string; type?: 'green' | 'red' } | null>(null);
  const showToast = (msg: string, type?: 'green' | 'red') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Soumettre l'évaluation
  const submitEval = () => {
    if (!eval_.note) { showToast(isFR ? '⭐ Sélectionnez une note avant de soumettre.' : '⭐ Select a rating before submitting.'); return; }
    setEval_((p) => ({ ...p, estSoumis: true }));
    showToast(isFR ? `✓ Évaluation ${eval_.note}★ envoyée — Merci !` : `✓ Rating ${eval_.note}★ submitted — Thank you!`, 'green');
  };

  // Détecte la fin du trajet pour afficher le popup d'évaluation
  const finDeTrajetDetected = trajetMap.state.estTermine && !eval_.estSoumis;
  useEffect(() => {
    if (finDeTrajetDetected) {
      const timer = setTimeout(() => setShowFinDeTrajet(true), 500);
      return () => clearTimeout(timer);
    }
  }, [finDeTrajetDetected]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: C.text }}>

      {/* La nav est gérée par le header de l'application (shared/components/header.tsx) */}

      {/* ── Carte résumé conducteur — pleine largeur, collée au header ── */}
      <TripHeaderCard
          title={titre}
          tripId={id}
          roleLabel={role === 'driver' ? (isFR ? 'Vue conducteur' : 'Driver view') : (isFR ? 'Vue passager' : 'Passenger view')}
          statusBadge={{
            label: isFR ? 'En cours…' : 'In progress…',
            color: '#0aad6a',
            bgColor: 'rgba(10,173,106,0.1)',
            borderColor: 'rgba(10,173,106,.25)',
            pulse: true,
          }}
          driver={{
            firstName: conducteur.prenom,
            lastName: conducteur.nom,
            initials: conducteur.initiales,
            rating: conducteur.note,
            tripCount: conducteur.nbTrajets,
            isVerified: conducteur.estVerifie,
            badges: conducteur.badges.map(b => ({ id: b.id, icon: b.icone, label: b.label })),
          }}
          vehicle={{
            label: `${conducteur.vehicule.marque} ${conducteur.vehicule.modele}`,
            color: conducteur.vehicule.couleur,
            plate: conducteur.vehicule.immatriculation,
          }}
          price={tarif.prixParPassager}
          departureDate={dateDepart}
          departureTime={heureDepart}
          availableSeats={statut.nbPlacesDisponibles}
          className="rounded-none rounded-b-2xl shadow-[0_4px_18px_rgba(8,49,110,0.09)]"
          actions={
            role === 'driver' ? (
              /* Conducteur : petit bouton Annuler en bas à droite */
              <div className="flex justify-end w-full ">
                <button
                  onClick={() => setShowCancelWarning(true)}
                  className="flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-xl text-center justify-center w-80 h-12 text-white cursor-pointer"
                  style={{ background: '#e03050' }}
                >
                  <FaBan size={16} /> {isFR ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            ) : (
              /* Passager : Appeler le conducteur + Annuler le trajet */
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

      {/* ── Contenu principal avec padding ── */}
      <div style={{ width: '100%', padding: '22px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ══ Section carte (placeholder) + progression qui chevauche le bas ══ */}
        <div style={{ position: 'relative', marginBottom: 40 }}>
          {/* Carte */}
          {/* Carte temps réel — MapService + Leaflet */}
          <TrajetMap height="400px" role={role} trajetHook={trajetMap} />

          {/* Progression — synchronisée avec l'état de la carte */}
          <div style={{ position: 'relative', marginTop: -32, zIndex: 2, padding: '0 16px' }}>
            <ProgressionSection
              fixture={progressionFixture}
              mapState={{
                pourcentageComplete: trajetMap.state.pourcentageComplete,
                distanceParcourue: trajetMap.state.distanceParcourue,
                distanceTotaleM: trajetMap.state.fixture.distanceTotaleM,
                estTermine: trajetMap.state.estTermine,
                labelDepart: trajetMap.state.fixture.labelDepart,
                labelArrivee: trajetMap.state.fixture.labelArrivee,
                vitesseMoyenneKmh: trajetMap.state.fixture.vitesseMoyenneKmh,
              }}
            />
          </div>
        </div>

        {/* ── Grille 3 colonnes : infos trajet + messagerie ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16, alignItems: 'stretch' }}>
          <TripInfoPanel
            depart={depart}
            arrivee={arrivee}
            preferences={preferences}
            statut={statut}
            conducteur={conducteur}
            tarif={tarif}
            isFR={isFR}
          >
            {role === 'driver' && passagers.length > 0 && (
              <PassengerList passagers={passagers} isFR={isFR} />
            )}
          </TripInfoPanel>

          {/* ═ Colonne 3 : Messagerie ═ */}
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
            />
          </div>
        </div>

        {/* ── Bas de page : Évaluation + Signalement ── */}
        <ActionBar
          conducteur={conducteur}
          depart={depart}
          arrivee={arrivee}
          eval_={eval_}
          setEval_={setEval_}
          onSubmitEval={submitEval}
          ratingLabels={RATING_LABELS}
          isFR={isFR}
          onShowSignalement={() => setShowSignalement(true)}
          onShowLitige={() => setShowLitige(true)}
        />
      </div>

      {/* ── Overlay de signalement ── */}
      {showSignalement && (
        <SignalementOverlay
          isOpen={showSignalement}
          trajetId={id}
          trajetTitre={titre}
          cibleNomParDefaut={conducteur.prenom + ' ' + conducteur.nom}
          cibleRoleParDefaut="conducteur"
          onClose={() => setShowSignalement(false)}
        />
      )}

      {/* ── Overlay de litige ── */}
      {showLitige && (
        <LitigeOverlay
          isOpen={showLitige}
          passagers={passagers}
          onClose={() => setShowLitige(false)}
          onSubmit={(data) => {
            showToast(isFR ? `Litige déclaré contre ${passagers.find(p => p.id === data.accuseId)?.prenom ?? 'inconnu'}` : `Dispute filed against ${passagers.find(p => p.id === data.accuseId)?.prenom ?? 'unknown'}`, 'red');
          }}
        />
      )}

      {/* ── Popup annulation — avertissement ── */}
      {showCancelWarning && (
        <CancelWarningModal
          isFR={isFR}
          onClose={() => setShowCancelWarning(false)}
          onConfirm={() => {
            setShowCancelWarning(false);
            showToast(isFR ? 'Trajet annulé. Des pénalités ont été appliquées.' : 'Trip cancelled. Penalties have been applied.', 'red');
          }}
        />
      )}

      {/* ── Popup fin de trajet — évaluation ── */}
      {showFinDeTrajet && (
        <TripEndEvalModal
          isFR={isFR}
          eval_={eval_}
          setEval_={setEval_}
          ratingLabels={RATING_LABELS}
          onClose={() => setShowFinDeTrajet(false)}
          onSubmit={() => { setShowFinDeTrajet(false); submitEval(); }}
        />
      )}

      {/* ── Popup erreur OSRM — avertissement réseau ── */}
      {showOsrmError && (
        <OsrmErrorModal
          isFR={isFR}
          onClose={() => setShowOsrmError(false)}
        />
      )}

      {/* ── Toast de notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 22px', borderRadius: 12,
          background: toast.type === 'green' ? C.green : toast.type === 'red' ? C.red : C.p,
          color: '#fff', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,.18)',
          animation: 'slideUp .3s ease',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
