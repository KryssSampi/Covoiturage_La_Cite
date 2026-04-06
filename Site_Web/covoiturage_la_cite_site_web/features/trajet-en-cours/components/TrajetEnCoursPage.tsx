'use client';
// ═══════════════════════════════════════════════════════════════════════
// Composant principal « Trajet en cours » — version refactorisée
// ═══════════════════════════════════════════════════════════════════════
import { FaBan } from 'react-icons/fa';

import { useTrajetEnCours } from '../hooks/useTrajetEnCours';
import { TrajetHeader } from './TrajetHeader';
import { TrajetMapSection } from './TrajetMapSection';
import { TrajetInfoPanel } from './TrajetInfoPanel';
import { TrajetActionBar } from './TrajetActionBar';
import { SignalementOverlay } from './SignalementOverlay';
import { LitigeOverlay } from './LitigeOverlay';
import { CancelWarningModal, TripEndEvalModal, OsrmErrorModal, TripCompletedModal } from './TripModals';
import { C } from './trajet-page-styles';

export default function TrajetEnCoursPage({ tripId }: { tripId?: string }) {
  const trajet = useTrajetEnCours({ tripId });
  const {
    trajetData, role, isFR, ratingLabels,
    mapFixture, activeProgressionFixture, trajetMap,
    driverPos, myPos, tripModel,
    moiInfo, correspondants, messagerie,
    showSignalement, showLitige, showCancelWarning,
    showTripCompleted, showFinDeTrajet, showOsrmError,
    eval_, setEval_, toast, alreadyReviewedIds,
    isLoading,
    setShowSignalement, setShowLitige, setShowCancelWarning,
    setShowTripCompleted, setShowFinDeTrajet, setShowOsrmError,
    showToast, submitEval, handleCancelTrip, handleRefreshMessages, handleTripCompletedOk,
  } = trajet;

  const { conducteur, depart, arrivee, passagers, titre, id } = trajetData;

  // ── Chargement ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: C.p, opacity: 0.6 }}>
          {isFR ? 'Chargement du trajet…' : 'Loading trip…'}
        </div>
      </div>
    );
  }

  // ── Trajet introuvable ───────────────────────────────────────────────────
  if (tripId && !tripModel) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: C.red }}>
          {isFR ? 'Trajet introuvable.' : 'Trip not found.'}
        </div>
      </div>
    );
  }

  // ── Rendu principal ──────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: C.text }}>

      {/* ── En-tête du trajet ── */}
      <TrajetHeader
        trajetData={trajetData}
        role={role}
        isFR={isFR}
        onCallDriver={() => showToast(isFR ? `Appel en cours vers ${conducteur.prenom}…` : `Calling ${conducteur.prenom}…`, 'green')}
        onCancelTrip={() => setShowCancelWarning(true)}
      />

      {/* ── Contenu principal ── */}
      <div style={{ width: '100%', padding: '22px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Carte + progression */}
        <TrajetMapSection
          role={role}
          mapFixture={mapFixture}
          activeProgressionFixture={activeProgressionFixture}
          trajetMap={trajetMap}
          driverPos={driverPos}
          myPos={myPos}
          departureCoords={tripModel?.departure.coordinates}
          arrivalCoords={tripModel?.arrival.coordinates}
          tripId={tripId}
        />

        {/* Panneau d'information + messagerie */}
        <TrajetInfoPanel
          trajetData={trajetData}
          role={role}
          isFR={isFR}
          moiInfo={moiInfo}
          correspondants={correspondants}
          messagerie={messagerie}
          onRefreshMessages={handleRefreshMessages}
        />

        {/* ActionBar */}
        <TrajetActionBar
          role={role}
          conducteur={conducteur}
          depart={depart}
          arrivee={arrivee}
          passagers={passagers}
          alreadyReviewedIds={alreadyReviewedIds}
          eval_={eval_}
          setEval_={setEval_}
          onSubmitEval={submitEval}
          ratingLabels={ratingLabels}
          isFR={isFR}
          onShowSignalement={() => setShowSignalement(true)}
          onShowLitige={() => setShowLitige(true)}
        />
      </div>

      {/* ── Overlays ── */}
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
          eval_={eval_} setEval_={setEval_} ratingLabels={ratingLabels}
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
