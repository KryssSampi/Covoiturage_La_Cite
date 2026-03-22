'use client';

/**
 * @file LitigeOverlay.tsx
 * @description Overlay de déclaration de litige pendant un trajet en cours.
 *
 * Formulaire en une seule étape :
 *   1. Sélection du passager accusé (recherche parmi les passagers du trajet)
 *   2. Type de litige (dropdown)
 *   3. Description libre (textarea)
 *
 * S'inspire du style de SignalementOverlay (même palette, même animation).
 */

import { useState, useMemo } from 'react';
import { FaGavel, FaTimes, FaSearch, FaCheck } from 'react-icons/fa';
import { Language, useAppState } from '@/core/state/app_state';
import type { PassagerInfo } from '../types/trajet-en-cours.types';
import type { TypeLitige } from '@/features/dashboard/types/affinite.types';

// ── Palette de couleurs (partagée avec TrajetEnCoursPage) ─────────────────
const C = {
  p: '#08316e', pl: '#1a5cb0',
  bg: '#f0f4fb', w: '#fff',
  red: '#e03050', green: '#0aad6a',
  muted: '#7a90b8', text: '#0d1f3c',
  b: 'rgba(8,49,110,0.09)',
} as const;

// ── Options de type de litige mappées à des labels ────────────────────────
// Fonction bilingue — options de type de litige
const getTYPE_OPTIONS = (isFR: boolean): { value: TypeLitige; label: string }[] => [
  { value: 'comportement', label: isFR ? 'Comportement inapproprié' : 'Inappropriate behaviour' },
  { value: 'securite',     label: isFR ? 'Problème de sécurité' : 'Safety issue' },
  { value: 'paiement',     label: isFR ? 'Problème de paiement' : 'Payment issue' },
  { value: 'retard',       label: isFR ? 'Retard important' : 'Significant lateness' },
  { value: 'annulation',   label: isFR ? 'Annulation abusive' : 'Abusive cancellation' },
  { value: 'degradation',  label: isFR ? 'Dégradation de véhicule' : 'Vehicle damage' },
  { value: 'autre',        label: isFR ? 'Autre' : 'Other' },
];

// ── Props ─────────────────────────────────────────────────────────────────
interface LitigeOverlayProps {
  isOpen: boolean;
  /** Liste des passagers du trajet (ceux que l'on peut accuser) */
  passagers: PassagerInfo[];
  /** Callback de fermeture */
  onClose: () => void;
  /** Callback quand le litige est soumis */
  onSubmit?: (data: { accuseId: string; type: TypeLitige; description: string }) => void;
}

export function LitigeOverlay({ isOpen, passagers, onClose, onSubmit }: LitigeOverlayProps) {
  // Langue courante
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const TYPE_OPTIONS = getTYPE_OPTIONS(isFR);
  // État du formulaire
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [type,        setType]        = useState<TypeLitige>('comportement');
  const [description, setDescription] = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  // Filtre les passagers selon la recherche
  const filteredPassagers = useMemo(() => {
    if (!searchQuery.trim()) return passagers;
    const q = searchQuery.toLowerCase();
    return passagers.filter(
      (p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(q)
    );
  }, [passagers, searchQuery]);

  // Passager sélectionné
  const selected = passagers.find((p) => p.id === selectedId);

  // Validation : tous les champs requis remplis
  const isValid = selectedId && description.trim().length >= 10;

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!isValid || !selectedId) return;
    onSubmit?.({ accuseId: selectedId, type, description: description.trim() });
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(8,49,110,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn .25s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.w, borderRadius: 20,
          width: '90%', maxWidth: 460, maxHeight: '85vh',
          overflowY: 'auto', padding: '28px 24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          animation: 'slideUp .3s ease',
        }}
      >
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaGavel size={18} color={C.red} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: C.text }}>
              {isFR ? 'Déclarer un litige' : 'File a dispute'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <FaTimes size={18} color={C.muted} />
          </button>
        </div>

        {submitted ? (
          /* ── Confirmation de soumission ── */
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: C.green, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FaCheck size={24} color="#fff" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>
              {isFR ? 'Litige déclaré avec succès' : 'Dispute filed successfully'}
            </p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
              {isFR ? <>Ton signalement contre <strong>{selected?.prenom} {selected?.nom}</strong> a été enregistré. L&apos;équipe examinera la situation.</> : <>Your report against <strong>{selected?.prenom} {selected?.nom}</strong> has been recorded. The team will review the situation.</>}
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 20, padding: '10px 28px',
                background: C.p, color: '#fff',
                borderRadius: 10, border: 'none',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {isFR ? 'Fermer' : 'Close'}
            </button>
          </div>
        ) : (
          /* ── Formulaire de litige ── */
          <>
            {/* 1. Recherche / sélection du passager accusé */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>
                {isFR ? 'Qui est en cause ?' : 'Who is involved?'}
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: `1.5px solid ${C.b}`, borderRadius: 10,
                padding: '8px 12px', background: C.bg,
              }}>
                <FaSearch size={13} color={C.muted} />
                <input
                  type="text"
                  placeholder={isFR ? "Rechercher un passager…" : "Search for a passenger…"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    outline: 'none', fontSize: 13, color: C.text,
                  }}
                />
              </div>

              {/* Liste des passagers filtrés */}
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredPassagers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedId(p.id); setSearchQuery(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10,
                      border: selectedId === p.id ? `2px solid ${C.p}` : `1px solid ${C.b}`,
                      background: selectedId === p.id ? 'rgba(8,49,110,0.06)' : C.w,
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: p.couleurAvatar, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 12,
                    }}>
                      {p.initiales}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>
                        {p.prenom} {p.nom}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        Place {p.place} • ★ {p.note}
                      </div>
                    </div>
                    {selectedId === p.id && (
                      <FaCheck size={14} color={C.p} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                ))}
                {filteredPassagers.length === 0 && (
                  <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: 10 }}>
                    {isFR ? 'Aucun passager trouvé.' : 'No passenger found.'}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Type de litige */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>
                {isFR ? 'Type de litige' : 'Dispute type'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeLitige)}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: `1.5px solid ${C.b}`, borderRadius: 10,
                  fontSize: 13, color: C.text, background: C.bg,
                  outline: 'none', cursor: 'pointer',
                }}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>
                {isFR ? 'Description' : 'Description'}
              </label>
              <textarea
                placeholder={isFR ? "Décris la situation en détail (minimum 10 caractères)…" : "Describe the situation in detail (minimum 10 characters)…"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: `1.5px solid ${C.b}`, borderRadius: 10,
                  fontSize: 13, color: C.text, background: C.bg,
                  outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, textAlign: 'right' }}>
                {description.length} {isFR ? `caractère${description.length !== 1 ? 's' : ''}` : `character${description.length !== 1 ? 's' : ''}`}
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              style={{
                width: '100%', padding: '12px 0',
                background: isValid ? C.red : '#c0c8d8',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 14, cursor: isValid ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
            >
              <FaGavel size={14} />
              {isFR ? 'Déclarer le litige' : 'File the dispute'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
