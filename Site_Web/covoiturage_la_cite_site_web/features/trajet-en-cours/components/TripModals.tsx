/**
 * @file TripModals.tsx
 * @description Modales du trajet en cours : annulation, évaluation fin de trajet, erreur OSRM.
 * Extraites depuis TrajetEnCoursPage pour réduire la taille du composant parent.
 */

import { useState } from 'react';
import {
  FaStar, FaRegStar, FaCheck, FaPaperPlane, FaUserFriends, FaFlagCheckered,
} from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

import { C } from './trajet-page-styles';
import type { EvaluationState, PassagerInfo } from '../types/trajet-en-cours.types';

// ── Overlay partagé par toutes les modales ────────────────────────────
function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  );
}

// ── Style commun de la carte modale ───────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: C.w, borderRadius: 16, padding: '28px 32px',
  maxWidth: 420, width: '90%',
  boxShadow: '0 12px 40px rgba(0,0,0,.2)',
  display: 'flex', flexDirection: 'column',
  textAlign: 'center',
};

// ═══════════════════════════════════════════════════════════════════════
// 1. Modale d'annulation — avertissement pénalités
// ═══════════════════════════════════════════════════════════════════════
export function CancelWarningModal({
  isFR,
  onClose,
  onConfirm,
}: {
  isFR: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalOverlay>
      <div style={{ ...cardStyle, gap: 16 }}>
        <FiAlertTriangle size={36} color={C.red} style={{ margin: '0 auto' }} />
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.p }}>
          {isFR ? 'Attention — annulation' : 'Warning — cancellation'}
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          {isFR
            ? "L'annulation d'un trajet en cours entraîne des pénalités financières et affecte votre score de fiabilité. Cette action est irréversible."
            : 'Cancelling a trip in progress results in financial penalties and affects your reliability score. This action is irreversible.'}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: `1.5px solid ${C.b2}`, background: C.bg,
              fontWeight: 700, fontSize: 13, color: C.p, cursor: 'pointer',
            }}
          >
            {isFR ? 'Revenir' : 'Go back'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: 'none', background: C.red,
              fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer',
            }}
          >
            {isFR ? 'Confirmer l\'annulation' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 2. Modale fin de trajet — évaluation avec notation
// ═══════════════════════════════════════════════════════════════════════

function StarRow({
  value,
  onChange,
  size = 24,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          {n <= value
            ? <FaStar size={size} color={C.gold} />
            : <FaRegStar size={size} color="rgba(8,49,110,0.15)" />}
        </button>
      ))}
    </div>
  );
}

export function TripEndEvalModal({
  isFR,
  role,
  passagers,
  alreadyReviewedIds = [],
  eval_,
  setEval_,
  ratingLabels,
  onClose,
  onSubmit,
  canDismiss = true,
}: {
  isFR: boolean;
  role: 'driver' | 'passenger';
  passagers: PassagerInfo[];
  alreadyReviewedIds?: string[];
  eval_: EvaluationState;
  setEval_: React.Dispatch<React.SetStateAction<EvaluationState>>;
  ratingLabels: Record<number, string>;
  onClose: () => void;
  onSubmit: () => void;
  canDismiss?: boolean;
}) {
  const [showOptional, setShowOptional] = useState(false);

  const canSubmit = eval_.note > 0 && eval_.commentaire.trim().length >= 10;
  const commentTooShort = eval_.commentaire.trim().length > 0 && eval_.commentaire.trim().length < 10;

  // Écran de remerciement après soumission
  if (eval_.estSoumis) {
    return (
      <ModalOverlay>
        <div style={{ ...cardStyle, gap: 16 }}>
          <FaCheck size={36} color={C.green} style={{ margin: '0 auto' }} />
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.p }}>
            {isFR ? 'Merci pour votre évaluation !' : 'Thank you for your review!'}
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            {isFR
              ? 'Votre avis aide la communauté à améliorer le covoiturage.'
              : 'Your feedback helps improve ridesharing for everyone.'}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px 0', borderRadius: 10,
              border: 'none', background: C.p,
              fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer',
            }}
          >
            {isFR ? 'Fermer' : 'Close'}
          </button>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <div style={{ ...cardStyle, gap: 14, maxWidth: 460, textAlign: 'left' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.p }}>
            {isFR ? 'Trajet terminé !' : 'Trip completed!'}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            {role === 'driver'
              ? (isFR ? 'Évaluez vos passagers' : 'Rate your passengers')
              : (isFR ? 'Évaluez votre conducteur' : 'Rate your driver')}
          </div>
        </div>

        {/* Sélecteur passager — conducteur uniquement */}
        {role === 'driver' && passagers.length > 0 && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <FaUserFriends size={13} color={C.p} />
              {isFR ? 'Évaluer votre passager :' : 'Rate your passenger:'}
            </label>
            <select
              value={eval_.passagerSelectionne ?? ''}
              onChange={(e) => setEval_((p) => ({ ...p, passagerSelectionne: e.target.value, note: 0, commentaire: '' }))}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: `1.5px solid ${C.b2}`, background: C.bg,
                fontSize: 13, color: C.text, fontFamily: 'DM Sans, sans-serif', outline: 'none',
              }}
            >
              <option value="">{isFR ? '— Choisir un passager —' : '— Select a passenger —'}</option>
              {passagers.map((p) => (
                <option key={p.id} value={p.id} disabled={alreadyReviewedIds.includes(p.id)}>
                  {p.prenom} {p.nom}{alreadyReviewedIds.includes(p.id) ? (isFR ? ' (déjà évalué)' : ' (already rated)') : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Note principale obligatoire */}
        {(role === 'passenger' || !!eval_.passagerSelectionne) && (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                {role === 'driver'
                  ? (isFR ? 'Note du passager *' : 'Passenger rating *')
                  : (isFR ? 'Note du conducteur *' : 'Driver rating *')}
              </div>
              <StarRow value={eval_.note} onChange={(n) => setEval_((p) => ({ ...p, note: n }))} size={28} />
              {eval_.note > 0 && (
                <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: 'block' }}>
                  {ratingLabels[eval_.note]}
                </span>
              )}
            </div>

            {/* Commentaire obligatoire */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 5 }}>
                {isFR ? 'Commentaire *' : 'Comment *'}
              </label>
              <textarea
                value={eval_.commentaire}
                onChange={(e) => setEval_((p) => ({ ...p, commentaire: e.target.value }))}
                placeholder={isFR ? 'Décrivez votre expérience (10 caractères min.)…' : 'Describe your experience (10 chars min.)…'}
                rows={3}
                style={{
                  width: '100%', background: C.bg, border: `1.5px solid ${commentTooShort ? C.red : C.b2}`,
                  borderRadius: 9, padding: '9px 12px', fontSize: 12,
                  fontFamily: 'DM Sans, sans-serif', color: C.text, outline: 'none',
                  resize: 'none', boxSizing: 'border-box',
                }}
              />
              {commentTooShort && (
                <span style={{ fontSize: 11, color: C.red }}>
                  {isFR ? 'Minimum 10 caractères.' : 'Minimum 10 characters.'}
                </span>
              )}
            </div>

            {/* Notes optionnelles */}
            <button
              onClick={() => setShowOptional((v) => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.p, textAlign: 'left', padding: 0, fontWeight: 600 }}
            >
              {showOptional
                ? (isFR ? '▲ Masquer les notes optionnelles' : '▲ Hide optional ratings')
                : (isFR ? '▼ Ajouter des notes optionnelles' : '▼ Add optional ratings')}
            </button>
            {showOptional && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0', borderTop: `1px solid ${C.b2}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{isFR ? 'Note du trajet' : 'Trip rating'}</span>
                  <StarRow value={eval_.noteTrajet ?? 0} onChange={(n) => setEval_((p) => ({ ...p, noteTrajet: n }))} size={20} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{isFR ? 'Note de la réservation' : 'Booking rating'}</span>
                  <StarRow value={eval_.noteReservation ?? 0} onChange={(n) => setEval_((p) => ({ ...p, noteReservation: n }))} size={20} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {canDismiss && (
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: `1.5px solid ${C.b2}`, background: C.bg,
                fontWeight: 700, fontSize: 13, color: C.p, cursor: 'pointer',
              }}
            >
              {isFR ? 'Plus tard' : 'Later'}
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: 'none', background: canSubmit ? C.green : C.b2,
              fontWeight: 700, fontSize: 13, color: '#fff',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <FaPaperPlane size={11} />
            {isFR ? 'Soumettre' : 'Submit'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3. Modale erreur OSRM — avertissement réseau
// ═══════════════════════════════════════════════════════════════════════
export function OsrmErrorModal({
  isFR,
  onClose,
}: {
  isFR: boolean;
  onClose: () => void;
}) {
  return (
    <ModalOverlay>
      <div style={{ ...cardStyle, maxWidth: 400, gap: 14 }}>
        <FiAlertTriangle size={36} color={C.gold} style={{ margin: '0 auto' }} />
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.p }}>
          {isFR ? 'Erreur de recalcul' : 'Recalculation error'}
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          {isFR
            ? "Recalcul de l'itinéraire impossible. L'itinéraire par défaut sera utilisé."
            : 'Route recalculation failed. The default route will be used.'}
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '10px 0', borderRadius: 10,
            border: 'none', background: C.p,
            fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer',
          }}
        >
          {isFR ? 'Compris' : 'OK'}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 4. Modale de fin de trajet — annonce que le trajet est terminé
//    Non-dismissible : l'utilisateur doit cliquer OK — Évaluer pour continuer.
// ═══════════════════════════════════════════════════════════════════════
export function TripCompletedModal({
  isFR,
  role,
  onOk,
}: {
  isFR: boolean;
  role: 'driver' | 'passenger';
  onOk: () => void;
}) {
  return (
    <ModalOverlay>
      <div style={{ ...cardStyle, gap: 18 }}>
        <FaFlagCheckered size={40} color={C.green} style={{ margin: '0 auto' }} />
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.p }}>
          {isFR ? 'Trajet terminé !' : 'Trip completed!'}
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          {role === 'driver'
            ? (isFR
                ? 'Vous avez bien complété votre trajet. Merci pour votre service !'
                : 'You have completed your trip. Thank you for your service!')
            : (isFR
                ? 'Vous êtes arrivé à destination. Bon séjour !'
                : 'You have arrived at your destination. Enjoy your stay!')}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>
          {isFR
            ? 'Veuillez évaluer votre expérience avant de quitter.'
            : 'Please rate your experience before leaving.'}
        </div>
        <button
          onClick={onOk}
          style={{
            padding: '12px 0', borderRadius: 10, width: '100%',
            border: 'none', background: C.p,
            fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer',
          }}
        >
          {isFR ? 'OK — Évaluer' : 'OK — Rate'}
        </button>
      </div>
    </ModalOverlay>
  );
}
