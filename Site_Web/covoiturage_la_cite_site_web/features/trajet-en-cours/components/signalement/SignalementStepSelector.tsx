'use client';
// ═══════════════════════════════════════════════════════════════════
// SignalementStepSelector — Étape 1 du signalement (choix de la cible)
// Composant générique pour la sélection d'options avec badge optionnel.
// ═══════════════════════════════════════════════════════════════════
import type { ReactNode } from 'react';
import { C } from '../signalement-overlay-data';

interface SelectorOption {
  id: string;
  label: string;
  sub: string;
  icone: ReactNode;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
}

interface SignalementStepSelectorProps {
  options: SelectorOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  title: string;
}

export function SignalementStepSelector({
  options,
  selectedId,
  onSelect,
  title,
}: SignalementStepSelectorProps) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 3, height: 12, background: C.red, borderRadius: 2 }} />
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {options.map((opt) => (
          <OptionButton
            key={opt.id}
            label={opt.label}
            sub={opt.sub}
            icone={opt.icone}
            selected={selectedId === opt.id}
            onClick={() => onSelect(opt.id)}
            badge={opt.badge}
            badgeBg={opt.badgeBg}
            badgeColor={opt.badgeColor}
          />
        ))}
      </div>
    </div>
  );
}

// ── Composant bouton radio réutilisable ──────────────────
function OptionButton({
  label, sub, icone, selected, onClick, badge, badgeBg, badgeColor,
}: {
  label: string; sub?: string; icone: ReactNode;
  selected: boolean; onClick: () => void;
  badge?: string; badgeBg?: string; badgeColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
        background: selected ? C.rnb : C.bg,
        border: `1.5px solid ${selected ? C.red : C.b}`,
        borderRadius: 10, cursor: 'pointer', transition: '.15s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? C.red : C.b2}`,
        background: selected ? C.red : C.w,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        border: `1px solid ${selected ? 'rgba(224,48,80,.25)' : C.b}`,
        background: C.w, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, flexShrink: 0,
      }}>{icone}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {badge && (
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
          background: badgeBg, color: badgeColor ?? C.text, flexShrink: 0,
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}
