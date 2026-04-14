'use client';
// ═══════════════════════════════════════════════════════════════════
// SignalementStepDetails — Étape 4 du signalement (détails & preuves)
// Description libre, heure de l'incident, pièces jointes, note GPS.
// ═══════════════════════════════════════════════════════════════════
import { FaTimes, FaPaperclip, FaFile, FaInfoCircle } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import type { SignalementData } from '../../types/progression-signalement.types';
import { C } from '../signalement-overlay-data';

interface SignalementStepDetailsProps {
  signalement: SignalementData;
  setDescription: (d: string) => void;
  setHeureIncident: (h: string) => void;
  ajouterPreuve: (p: string) => void;
  supprimerPreuve: (i: number) => void;
  isFR: boolean;
}

export function SignalementStepDetails({
  signalement, setDescription, setHeureIncident, ajouterPreuve, supprimerPreuve, isFR,
}: SignalementStepDetailsProps) {
  return (
    <div>
      {/* Résumé du motif sélectionné */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px',
        background: C.rnb, border: `1px solid rgba(224,48,80,.18)`,
        borderRadius: 8, marginBottom: 14, fontSize: 11, color: C.red,
      }}>
        <FiAlertTriangle size={11} style={{ marginRight: 4 }} /> <strong>{signalement.cible}</strong> · {signalement.motifLabel}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>
          {isFR ? 'DESCRIPTION DU PROBLÈME' : 'PROBLEM DESCRIPTION'} <span style={{ color: C.red }}>*</span>
        </label>
        <textarea
          value={signalement.description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isFR ? "Décrivez ce qui s'est passé avec précision : heure, lieu, paroles ou gestes, contexte…" : "Describe what happened precisely: time, place, words or actions, context…"}
          style={{
            width: '100%', padding: '10px 13px', borderRadius: 9,
            border: `1.5px solid ${signalement.description.length >= 50 ? C.b2 : C.red}`,
            fontSize: 13, fontFamily: 'DM Sans, sans-serif',
            background: C.bg, color: C.text, outline: 'none',
            resize: 'vertical', minHeight: 90, lineHeight: 1.6,
          }}
        />
        <div style={{
          fontSize: 10, textAlign: 'right', marginTop: 3,
          color: signalement.description.length < 50 ? C.red : C.muted,
        }}>
          {signalement.description.length} / 1000 {isFR ? 'car.' : 'char.'} (min. 50)
        </div>
      </div>

      {/* Heure de l'incident */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>
          {isFR ? "HEURE APPROXIMATIVE DE L'INCIDENT" : 'APPROXIMATE TIME OF INCIDENT'}
        </label>
        <input
          type="time"
          value={signalement.heureIncident}
          onChange={(e) => setHeureIncident(e.target.value)}
          style={{
            padding: '10px 13px', borderRadius: 9,
            border: `1.5px solid ${C.b2}`, fontSize: 13,
            background: C.bg, color: C.text, outline: 'none',
          }}
        />
      </div>

      {/* Preuves */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.4px', display: 'block', marginBottom: 6 }}>
          {isFR ? 'PREUVES (optionnel — max 5 fichiers)' : 'EVIDENCE (optional — max 5 files)'}
        </label>
        <div
          onClick={() => {
            if (signalement.preuves.length < 5) {
              const labels = ['photo-1', 'image-1', 'doc-1', 'photo-2', 'note-1'];
              ajouterPreuve(labels[signalement.preuves.length] ?? 'fichier');
            }
          }}
          style={{
            border: `2px dashed ${C.b2}`, borderRadius: 10, padding: 18,
            textAlign: 'center', cursor: 'pointer', background: C.bg,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}><FaPaperclip size={22} color={C.p} /></div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.p }}>
            {signalement.preuves.length < 5 ? (isFR ? 'Ajouter une preuve (simulation)' : 'Add evidence (simulation)') : (isFR ? 'Maximum atteint' : 'Maximum reached')}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>JPG, PNG, PDF · 10 MB max</div>
          {signalement.preuves.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10, justifyContent: 'center' }}>
              {signalement.preuves.map((pv, i) => (
                <div key={i} style={{
                  width: 50, height: 50, borderRadius: 8, background: C.pg2,
                  border: `1px solid ${C.b}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, position: 'relative',
                }}>
                  <FaFile size={16} color={C.p} />
                  <button
                    onClick={(e) => { e.stopPropagation(); supprimerPreuve(i); }}
                    style={{
                      position: 'absolute', top: -5, right: -5,
                      width: 16, height: 16, borderRadius: '50%',
                      background: C.red, color: '#fff', border: 'none',
                      fontSize: 9, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  ><FaTimes size={8} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note GPS automatique */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px',
        background: C.pg, borderLeft: `3px solid ${C.p}`,
        borderRadius: '0 8px 8px 0', fontSize: 11, color: C.p, lineHeight: 1.6,
      }}>
        <FaInfoCircle size={12} style={{ flexShrink: 0, marginRight: 4 }} /> {isFR ? 'Le journal GPS complet du trajet sera automatiquement joint comme preuve objective.' : 'The full GPS log of the trip will be automatically attached as objective evidence.'}
      </div>
    </div>
  );
}
