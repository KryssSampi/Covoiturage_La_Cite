/**
 * @file TripModals.tsx
 * @description Modales du trajet en cours : annulation, évaluation fin de trajet, erreur OSRM.
 * Extraites depuis TrajetEnCoursPage pour réduire la taille du composant parent.
 */

import {
  FaStar, FaRegStar, FaCheck, FaPaperPlane,
} from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

import { C } from './trajet-page-styles';
import type { EvaluationState } from '../types/trajet-en-cours.types';

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
export function TripEndEvalModal({
  isFR,
  eval_,
  setEval_,
  ratingLabels,
  onClose,
  onSubmit,
}: {
  isFR: boolean;
  eval_: EvaluationState;
  setEval_: React.Dispatch<React.SetStateAction<EvaluationState>>;
  ratingLabels: Record<number, string>;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <ModalOverlay>
      <div style={{ ...cardStyle, gap: 14 }}>
        <FaCheck size={30} color={C.green} style={{ margin: '0 auto' }} />
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.p }}>
          {isFR ? 'Trajet terminé !' : 'Trip completed!'}
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          {isFR
            ? 'Vous êtes arrivé à destination. Notez votre expérience pour aider la communauté.'
            : 'You have arrived at your destination. Rate your experience to help the community.'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setEval_((p) => ({ ...p, note: n }))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
            >
              {n <= eval_.note
                ? <FaStar size={28} color={C.gold} />
                : <FaRegStar size={28} color="rgba(8,49,110,0.15)" />}
            </button>
          ))}
        </div>
        {eval_.note > 0 && (
          <span style={{ fontSize: 12, color: C.muted }}>{ratingLabels[eval_.note]}</span>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
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
          <button
            onClick={onSubmit}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: 'none', background: C.green,
              fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer',
            }}
          >
            <FaPaperPlane size={11} style={{ marginRight: 6 }} />
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
