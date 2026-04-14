'use client';
// ═══════════════════════════════════════════════════════════════════
// SignalementConfirmation — Écran post-soumission du signalement
// Affiche la référence, les étapes du processus et le PDF.
// ═══════════════════════════════════════════════════════════════════
import { FaDownload } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';
import { C } from '../signalement-overlay-data';

interface SignalementConfirmationProps {
  referenceSignalement: string;
  telechargerPDF: () => void;
  onClose: () => void;
  reinitialiser: () => void;
  isFR: boolean;
}

export function SignalementConfirmation({
  referenceSignalement, telechargerPDF, onClose, reinitialiser, isFR,
}: SignalementConfirmationProps) {
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: C.gnb, border: `2px solid rgba(10,173,106,.25)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)',
      }}><FaCircleCheck size={30} color={C.green} /></div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: C.p }}>{isFR ? 'Signalement envoyé' : 'Report sent'}</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 360 }}>
        {isFR ? 'Votre signalement a bien été reçu. Notre équipe de modération le traitera sous 48h.' : 'Your report has been received. Our moderation team will handle it within 48h.'}
      </div>
      <div style={{
        background: C.pg2, border: `1px solid ${C.b}`,
        borderRadius: 9, padding: '8px 18px',
        fontFamily: 'monospace', fontSize: 12, color: C.p, letterSpacing: '.5px',
      }}>
        #{referenceSignalement}
      </div>

      {/* Étapes du processus */}
      <div style={{
        textAlign: 'left', width: '100%',
        background: C.bg, border: `1px solid ${C.b}`,
        borderRadius: 10, padding: '13px 15px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {[
          { ico: '1', txt: <><strong>{isFR ? 'Réception immédiate' : 'Immediate receipt'}</strong> — {isFR ? 'Signalement enregistré et horodaté' : 'Report recorded and timestamped'}</> },
          { ico: '2', txt: <><strong>{isFR ? 'Analyse sous 24h' : 'Analysis within 24h'}</strong> — {isFR ? 'Examen des preuves et du journal GPS' : 'Review of evidence and GPS log'}</> },
          { ico: '3', txt: <><strong>{isFR ? 'Résolution sous 48h' : 'Resolution within 48h'}</strong> — {isFR ? 'Décision prise, notification par email' : 'Decision made, email notification'}</> },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.p, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {r.ico}
            </div>
            <div style={{ lineHeight: 1.55, color: C.text }}>{r.txt}</div>
          </div>
        ))}
      </div>

      <button
        onClick={telechargerPDF}
        style={{
          width: '100%', padding: 11,
          background: C.bg, border: `1.5px solid ${C.b2}`,
          borderRadius: 10, color: C.p, fontWeight: 700, fontSize: 13,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}
      >
        <FaDownload size={13} /> {isFR ? 'Télécharger le rapport PDF' : 'Download PDF report'}
      </button>
      <button
        onClick={() => { onClose(); reinitialiser(); }}
        style={{
          width: '100%', padding: 12,
          background: `linear-gradient(135deg,${C.p},${C.pl})`,
          border: 'none', borderRadius: 10, color: '#fff',
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}
      >
        {isFR ? 'Fermer' : 'Close'}
      </button>
    </div>
  );
}
