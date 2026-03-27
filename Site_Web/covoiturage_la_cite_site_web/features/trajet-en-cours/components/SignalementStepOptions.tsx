'use client';
// ═══════════════════════════════════════════════════════════════════
// SignalementStepOptions — Étape 5 du signalement (options + récap)
// Toggles anonyme/contact/blocage/notification + résumé complet.
// ═══════════════════════════════════════════════════════════════════
import type { ReactNode } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import type { SignalementData, SignalementOptions, NiveauSecurite } from '../types/progression-signalement.types';
import { C } from './signalement-overlay-data';

interface SignalementStepOptionsProps {
  signalement: SignalementData;
  setOption: (key: keyof SignalementOptions, value: boolean) => void;
  /** Tableau instancié avec getSEV_OPTIONS(isFR) depuis le parent */
  sevOptions: { id: NiveauSecurite; label: string; desc: string; icone: ReactNode; bg: string; color: string; badge: string; badgeBg: string }[];
  isFR: boolean;
}

export function SignalementStepOptions({
  signalement, setOption, sevOptions, isFR,
}: SignalementStepOptionsProps) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 3, height: 12, background: C.red, borderRadius: 2 }} />
        {isFR ? 'Préférences de suivi' : 'Follow-up preferences'}
      </div>

      {[
        { key: 'anonyme' as const,            label: isFR ? 'Signalement anonyme' : 'Anonymous report',            sub: isFR ? 'La personne signalée ne saura pas que c\'est vous.' : 'The reported person will not know it was you.', val: signalement.options.anonyme       },
        { key: 'accepterContact' as const,    label: isFR ? "Accepter d'être contacté(e)" : 'Accept to be contacted',    sub: isFR ? "Un admin peut vous contacter pour plus d'infos." : 'An admin may contact you for more info.',     val: signalement.options.accepterContact },
        { key: 'bloquerUtilisateur' as const, label: isFR ? 'Bloquer cet utilisateur' : 'Block this user',         sub: isFR ? 'Vous ne serez plus mis en relation ensemble.' : 'You will no longer be matched together.',       val: signalement.options.bloquerUtilisateur },
        { key: 'notifierResultat' as const,   label: isFR ? 'Me notifier du résultat' : 'Notify me of the result',         sub: isFR ? 'Email de résolution sous 48h.' : 'Resolution email within 48h.',                      val: signalement.options.notifierResultat },
      ].map((opt) => (
        <div
          key={opt.key}
          onClick={() => setOption(opt.key, !opt.val)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 13px', background: C.bg, border: `1px solid ${C.b}`,
            borderRadius: 9, marginBottom: 8, cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{opt.label}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{opt.sub}</div>
          </div>
          {/* Interrupteur toggle */}
          <div style={{
            width: 36, height: 20, borderRadius: 10,
            background: opt.val ? C.green : 'rgba(8,49,110,0.1)',
            border: `1.5px solid ${opt.val ? C.green : C.b2}`,
            position: 'relative', flexShrink: 0, transition: '.3s',
          }}>
            <div style={{
              position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
              top: 1, left: opt.val ? 19 : 1, transition: '.3s',
              boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            }} />
          </div>
        </div>
      ))}

      {/* Récapitulatif */}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.6px', textTransform: 'uppercase', margin: '16px 0 9px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 3, height: 12, background: C.red, borderRadius: 2 }} />
        {isFR ? 'Récapitulatif' : 'Summary'}
      </div>
      <div style={{
        background: C.bg, border: `1px solid ${C.b}`, borderRadius: 10,
        padding: '13px 15px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {[
          { k: isFR ? 'Signalement contre' : 'Report against', v: `${signalement.cibleNom} (${signalement.cible})` },
          { k: isFR ? 'Motif' : 'Reason',             v: signalement.motifLabel || '—' },
          { k: isFR ? 'Sécurité' : 'Safety',          v: sevOptions.find((s) => s.id === signalement.niveauSecurite)?.label ?? '—' },
          { k: 'Description',       v: signalement.description.trim().slice(0, 80) + (signalement.description.length > 80 ? '…' : '') || '—' },
          { k: isFR ? 'Preuves' : 'Evidence',           v: isFR ? `${signalement.preuves.length} fichier(s) + GPS auto` : `${signalement.preuves.length} file(s) + auto GPS` },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 4 ? `1px solid ${C.b}` : 'none' }}>
            <span style={{ color: C.muted, fontSize: 10 }}>{r.k}</span>
            <span style={{ fontWeight: 600, fontSize: 11, maxWidth: 260, textAlign: 'right' }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px',
        background: C.pg, borderLeft: `3px solid ${C.p}`,
        borderRadius: '0 8px 8px 0', fontSize: 11, color: C.p, lineHeight: 1.6,
        marginTop: 12,
      }}>
        <FaShieldAlt size={12} style={{ flexShrink: 0, marginRight: 4 }} /> {isFR ? <>Ce signalement est traité sous 48h. En cas de danger immédiat, appelez le <strong>911</strong>.</> : <>This report is handled within 48h. In case of immediate danger, call <strong>911</strong>.</>}
      </div>
    </div>
  );
}
