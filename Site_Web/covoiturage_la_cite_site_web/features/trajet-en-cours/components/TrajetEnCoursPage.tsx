'use client';
// ═══════════════════════════════════════════════════════════════════════
// Composant principal « Trajet en cours »
// Assemble ProgressionSection · Messagerie · SignalementOverlay
// ═══════════════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import {
  FaStar, FaRegStar, FaPhone, FaBan, FaFlag, FaCheck,
  FaPaperPlane, FaSuitcase, FaPaw,
  FaSmokingBan, FaMusic, FaCommentDots, FaShieldAlt,
} from 'react-icons/fa';
import {
  FaCircleXmark,
} from 'react-icons/fa6';
import {
  FiSend, FiAlertTriangle,
} from 'react-icons/fi';

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
import { Language, useAppState } from '@/core/state/app_state';

// ── Palette de couleurs ──────────────────────────────────────────────
const C = {
  p: '#08316e', pm: '#0d4490', pl: '#1a5cb0', pd: '#051f4a',
  bg: '#f0f4fb', w: '#fff',
  green: '#0aad6a', gnb: 'rgba(10,173,106,0.1)',
  red: '#e03050', rnb: 'rgba(224,48,80,0.09)',
  gold: '#c8960a', gnl: 'rgba(200,150,10,0.09)',
  cyan: '#0098c8',
  muted: '#7a90b8', text: '#0d1f3c',
  b: 'rgba(8,49,110,0.09)', b2: 'rgba(8,49,110,0.18)',
  sh: '0 2px 18px rgba(8,49,110,0.09)',
} as const;

// Styles réutilisables pour les cartes
const card = {
  background: C.w, border: `1px solid ${C.b}`,
  borderRadius: 16, boxShadow: C.sh,
  overflow: 'hidden' as const,
};

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

  // ── Messagerie hook ──
  const messagerie = useMessagerie(correspondants, correspondants[0]?.id);

  // ── Hook carte partagé : état unique pour TrajetMap + ProgressionSection ──
  const trajetMap = useTrajetMap(mapFixture);
  const [showSignalement, setShowSignalement] = useState(false);
  // ── Litige ──
  const [showLitige, setShowLitige] = useState(false);

  // ── Évaluation ──
  const [eval_, setEval_] = useState<EvaluationState>({ note: 0, commentaire: '', estSoumis: false });

  // ── Simuler réception (outil de dev) ──
  const [simInput, setSimInput] = useState('');

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
                  onClick={() => showToast(isFR ? 'Fonctionnalité d\'annulation — ouvrir modale' : 'Cancellation feature — open modal', 'red')}
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
                  onClick={() => showToast(isFR ? 'Fonctionnalité d\'annulation — ouvrir modale' : 'Cancellation feature — open modal', 'red')}
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

        {/* ── Grille 3 colonnes : 2 détails même largeur + messagerie plus large, même hauteur ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16, alignItems: 'stretch' }}>

          {/* ═ Colonne 1 : Points du trajet + Préférences ═ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Points du trajet */}
            <div style={{ ...card, flex: 1 }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.p, display: 'inline-block' }} />
                  Points du trajet
                </div>
                {/* Départ */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.green, marginTop: 3 }} />
                    <div style={{ width: 1.5, height: 18, background: 'rgba(8,49,110,0.12)', margin: '2px 0' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{isFR ? 'Départ' : 'Departure'} — {depart.nom}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 1, lineHeight: 1.4 }}>{depart.adresse}</div>
                    {depart.instructions && (
                      <div style={{ fontSize: 12, color: C.cyan, marginTop: 3, fontStyle: 'italic' }}>{depart.instructions}</div>
                    )}
                  </div>
                </div>
                {/* Arrivée */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{isFR ? 'Arrivée' : 'Arrival'} — {arrivee.nom}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 1, lineHeight: 1.4 }}>{arrivee.adresse}</div>
                    {arrivee.instructions && (
                      <div style={{ fontSize: 12, color: C.cyan, marginTop: 3, fontStyle: 'italic' }}>{arrivee.instructions}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Préférences */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, display: 'inline-block' }} />
                  {isFR ? 'Préférences & services' : 'Preferences & services'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { ok: preferences.bagagesAutorises, label: isFR ? 'Bagages autorisés' : 'Luggage allowed', Icon: FaSuitcase },
                    { ok: preferences.animauxAcceptes, label: isFR ? 'Animaux acceptés' : 'Pets accepted', Icon: FaPaw },
                    { ok: !preferences.fumeur, label: isFR ? 'Non-fumeur' : 'Non-smoking', Icon: FaSmokingBan },
                    { ok: preferences.musique, label: isFR ? 'Musique acceptée' : 'Music accepted', Icon: FaMusic },
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <p.Icon size={15} color={p.ok ? C.green : C.muted} />
                      <span style={{ color: p.ok ? C.green : C.red, fontWeight: 600 }}>
                        {p.ok ? <FaCheck size={10} /> : <FaCircleXmark size={10} />}
                      </span>
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
                {preferences.messagePassagers && (
                  <div style={{ marginTop: 10, padding: '8px 10px', background: C.bg, borderRadius: 8, fontSize: 13, color: C.p, borderLeft: `3px solid ${C.p}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaCommentDots size={13} color={C.p} />
                    <em>{preferences.messagePassagers}</em>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═ Colonne 2 : Statut du trajet ═ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ ...card, flex: 1 }}>
              {/* Statut */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                  {isFR ? 'Statut du trajet' : 'Trip status'}
                </div>
                {[
                  { k: isFR ? 'État' : 'Status', v: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: C.gnb, color: C.green, fontSize: 12, fontWeight: 700, border: '1px solid rgba(10,173,106,.25)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />{isFR ? 'En cours…' : 'In progress…'}</span> },
                  { k: isFR ? 'Type de départ' : 'Departure type', v: statut.typeDepart === 'unique' ? (isFR ? 'Unique' : 'One-time') : (isFR ? 'Récurrent' : 'Recurring') },
                  { k: isFR ? 'Récurrent' : 'Recurring', v: statut.estRecurrent ? (isFR ? 'Oui' : 'Yes') : (isFR ? 'Non' : 'No') },
                  { k: isFR ? 'Détour max.' : 'Max detour', v: `${statut.detourMaxMin} min` },
                  { k: isFR ? 'Paiement' : 'Payment', v: statut.modePaiement === 'comptant' ? (isFR ? 'Argent comptant' : 'Cash') : (isFR ? 'Virtuel' : 'Virtual') },
                  { k: isFR ? 'Places' : 'Seats', v: `${statut.nbPlacesDisponibles} / ${statut.nbPlacesTotales} ${isFR ? 'disponibles' : 'available'}` },
                  { k: isFR ? 'Dernière MÀJ' : 'Last update', v: <span style={{ color: C.muted }}>{statut.derniereMaj.toLocaleDateString(isFR ? 'fr-CA' : 'en-CA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span> },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 6 ? '1px solid rgba(8,49,110,.05)' : 'none' }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{row.k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Véhicule */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
                  {isFR ? 'Véhicule' : 'Vehicle'}
                </div>
                {[
                  { k: isFR ? 'Modèle' : 'Model', v: `${conducteur.vehicule.marque} ${conducteur.vehicule.modele} ${conducteur.vehicule.annee}` },
                  { k: isFR ? 'Couleur' : 'Color', v: conducteur.vehicule.couleur },
                  { k: isFR ? 'Plaque' : 'Plate', v: <span style={{ fontFamily: 'monospace' }}>{conducteur.vehicule.immatriculation}</span> },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 2 ? '1px solid rgba(8,49,110,.05)' : 'none' }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{row.k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Tarification */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.p, display: 'inline-block' }} />
                  {isFR ? 'Tarification' : 'Pricing'}
                </div>
                {[
                  { k: isFR ? 'Prix par passager' : 'Price per passenger', v: <span style={{ color: C.green, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>+{tarif.prixParPassager} $</span> },
                  { k: isFR ? 'Économie vs taxi' : 'Savings vs taxi', v: <span style={{ color: C.green }}>~{tarif.economieVsTaxi} $</span> },
                  { k: isFR ? 'CO₂ économisé' : 'CO₂ saved', v: <span style={{ color: C.green, display: 'inline-flex', alignItems: 'center', gap: 3 }}>~{tarif.co2EconomiseKg} kg <FaShieldAlt size={11} color={C.green} /></span> },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 2 ? '1px solid rgba(8,49,110,.05)' : 'none' }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{row.k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liste des passagers (visible seulement pour le conducteur) */}
            {role === 'driver' && passagers.length > 0 && (
              <div style={card}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, display: 'inline-block' }} />
                    Passagers à bord ({passagers.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {passagers.map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: C.bg, borderRadius: 9, border: `1px solid ${C.b}` }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: p.couleurAvatar,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0,
                        }}>
                          {p.initiales}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.prenom} {p.nom}</div>
                          <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isFR ? 'Siège' : 'Seat'} {p.place} · <FaStar size={10} color={C.gold} /> {p.note}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: C.gnb, color: C.green }}>
                          {isFR ? 'À bord' : 'On board'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═ Colonne 3 : Messagerie + panneau test ═ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Messagerie
              roleMoi={role}
              correspondants={correspondants}
              moi={moiInfo}
              conversationState={messagerie.conversationState}
              onEnvoyerMessage={messagerie.envoyerMessage}
              onChangerCorrespondant={messagerie.changerCorrespondant}
              onBroadcast={messagerie.broadcast}
            />

            {/* Panneau de test : simuler réception */}
            <div style={{
              background: C.w, border: `1px dashed ${C.b2}`, borderRadius: 12,
              padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiAlertTriangle size={12} color={C.gold} /> Test
              </div>
              <input
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && simInput.trim()) {
                    messagerie.simulerReception(simInput.trim());
                    setSimInput('');
                  }
                }}
                placeholder={`${isFR ? 'Simuler un message de' : 'Simulate a message from'} ${messagerie.correspondantActif?.prenom ?? '—'}…`}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8,
                  border: `1.5px solid ${C.b2}`, background: C.bg,
                  fontSize: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: C.text,
                }}
              />
              <button
                onClick={() => {
                  if (simInput.trim()) {
                    messagerie.simulerReception(simInput.trim());
                    setSimInput('');
                  }
                }}
                style={{
                  padding: '8px 16px', background: C.p, border: 'none',
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <FiSend size={11} /> {isFR ? 'Recevoir' : 'Receive'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Bas de page : Évaluation + Signalement ── */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>

          {/* Carte évaluation — disposition verticale : titre + détails/étoiles en horizontal, puis commentaire en dessous */}
          <div className='justify-items-center' style={{ ...card, flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Ligne du haut : titre + détails + étoiles (horizontal) */}
            <div className='my-5' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: C.p, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaStar size={14} color={C.gold} /> {isFR ? 'Évaluer votre trajet' : 'Rate your trip'}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {conducteur.prenom} {conducteur.nom} · {depart.nom} → {arrivee.nom}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => !eval_.estSoumis && setEval_((p) => ({ ...p, note: n }))}
                      style={{
                        background: 'none', border: 'none', cursor: eval_.estSoumis ? 'default' : 'pointer',
                        transition: '.15s', lineHeight: 1, padding: 0,
                      }}
                    >
                      {n <= eval_.note
                        ? <FaStar size={22} color={C.gold} />
                        : <FaRegStar size={22} color="rgba(8,49,110,0.12)" />
                      }
                    </button>
                  ))}
                </div>
                {eval_.note > 0 && (
                  <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                    {RATING_LABELS[eval_.note]}
                  </span>
                )}
              </div>
            </div>

            {/* Commentaire + bouton soumettre en dessous */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={eval_.commentaire}
                onChange={(e) => !eval_.estSoumis && setEval_((p) => ({ ...p, commentaire: e.target.value }))}
                placeholder={isFR ? "Laisser un commentaire… (optionnel)" : "Leave a comment… (optional)"}
                disabled={eval_.estSoumis}
                style={{
                  flex: 1, background: C.bg, border: `1.5px solid ${C.b2}`,
                  borderRadius: 9, padding: '9px 12px', fontSize: 12,
                  fontFamily: 'DM Sans, sans-serif', color: C.text, outline: 'none',
                  resize: 'none', height: 54,
                }}
              />
              <button
                onClick={submitEval}
                disabled={eval_.estSoumis}
                style={{
                  padding: '9px 20px', borderRadius: 9,
                  background: eval_.estSoumis ? C.green : C.p,
                  color: '#fff',
                  border: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
                  cursor: eval_.estSoumis ? 'default' : 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {eval_.estSoumis ? <><FaCheck size={11} /> {isFR ? 'Envoyé' : 'Sent'}</> : <><FaPaperPlane size={11} /> {isFR ? 'Soumettre' : 'Submit'}</>}
              </button>
            </div>
          </div>

          {/* Carte signalement + SOS + Litige */}
          <div style={{
            ...card,
            padding: '18px 22px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', gap: 10, minWidth: 180, textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: C.text }}>
              {isFR ? 'Signaler un trajet' : 'Report a trip'}
            </div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>
              {isFR ? <>Un problème<br />pendant ce trajet ?</> : <>A problem<br />during this trip?</>}
            </div>
            <button
              onClick={() => setShowSignalement(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', background: C.red,
                border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
            >
              <FaFlag size={12} /> {isFR ? 'Signaler un problème' : 'Report a problem'}
            </button>

            {/* Bouton Déclarer un litige */}
            <button
              onClick={() => setShowLitige(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', background: C.p,
                border: 'none',
                minWidth: 180,
                borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
            >
              <FaShieldAlt size={12} /> {isFR ? 'Déclarer un litige' : 'File a dispute'}
            </button>

            {/* Bouton SOS Urgence — mobile uniquement (appel 911) */}
            <a
              href="tel:911"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', background: '#b91c1c',
                border: 'none',
                minWidth: 180,
                borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12,
                textDecoration: 'none', cursor: 'pointer',
              }}
              className="md:hidden"
            >
              <FaPhone size={12} /> {isFR ? 'SOS Urgence' : 'SOS Emergency'}
            </a>
          </div>
        </div>
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
