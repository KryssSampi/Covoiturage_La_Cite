'use client';
// ═══════════════════════════════════════════════════════════════════
// ProgressionSection — Barre de progression temps réel
// Messagerie — Composant de messagerie en temps réel
// ═══════════════════════════════════════════════════════════════════
import { useRef, useEffect, useMemo } from 'react';
import { FaMapMarkedAlt, FaCheck, FaSyncAlt } from 'react-icons/fa';
import { ProgressionSectionProps } from '../types/progression-signalement.types';
import { MessagerieProps } from '../types/messagerie.types';
import { useProgression } from '../hooks/index.hooks';
import { Language, useAppState } from '@/core/state/app_state';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

// Palette de couleurs partagée
const C = {
  bg:      '#f0f4fb',
  white:   '#fff',
  p:       '#08316e',
  pm:      '#0d4490',
  green:   '#0aad6a',
  gnb:     'rgba(10,173,106,0.1)',
  gold:    '#c8960a',
  muted:   '#7a90b8',
  b:       'rgba(8,49,110,0.09)',
  cyan:    '#0098c8',
} as const;

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} min ${s > 0 ? s + ' s' : ''}` : `${s} s`;
}

// ═══════════════════════════════════════════════════════════════════
// ProgressionSection
// ═══════════════════════════════════════════════════════════════════

export function ProgressionSection({ fixture, mapState }: ProgressionSectionProps) {
  // Suspendre la simulation interne quand mapState est fourni (positions GPS réelles)
  const { fixture: activeFixture, progression: internalProg } = useProgression(fixture, !!mapState);
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Quand mapState est fourni, on dérive la progression depuis l'état de la carte
  const progression = mapState ? (() => {
    const { pourcentageComplete, distanceParcourue, distanceTotaleM, estTermine, vitesseMoyenneKmh } = mapState;
    const distParcourueKm = parseFloat((distanceParcourue / 1000).toFixed(1));
    const distRestanteKm = parseFloat(((distanceTotaleM - distanceParcourue) / 1000).toFixed(1));
    const mPerSec = (vitesseMoyenneKmh * 1000) / 3600;
    const secRestantes = mPerSec > 0 ? Math.max(0, Math.round((distanceTotaleM - distanceParcourue) / mPerSec)) : 0;
    const eta = new Date();
    eta.setSeconds(eta.getSeconds() + secRestantes);
    const etaTexte = eta.toLocaleTimeString(isFR ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' });

    // Statuts des waypoints basés sur la distance réelle GPS (normalisée en %)
    // On compare le % parcouru vs le % de chaque étape dans la fixture,
    // ce qui reste exact même si la distance OSRM diffère de la fixture.
    const fixtureTotal = activeFixture.distanceTotaleKm > 0 ? activeFixture.distanceTotaleKm : 1;
    const statutsEtapes: string[] = activeFixture.etapes.map(() => 'en_attente');
    for (let i = 0; i < activeFixture.etapes.length; i++) {
      const etapePct = (activeFixture.etapes[i].distanceKm / fixtureTotal) * 100;
      if (pourcentageComplete >= etapePct) statutsEtapes[i] = 'fait';
    }
    const prochaine = activeFixture.etapes.findIndex((e) => {
      const etapePct = (e.distanceKm / fixtureTotal) * 100;
      return pourcentageComplete < etapePct;
    });
    if (prochaine !== -1 && !estTermine) statutsEtapes[prochaine] = 'actif';

    return {
      pourcentage: pourcentageComplete,
      distanceParcourueKm: distParcourueKm,
      distanceRestanteKm: distRestanteKm,
      dureeRestanteSecondes: secRestantes,
      etaTexte,
      statutsEtapes: statutsEtapes as import('../types/progression-signalement.types').StatutEtape[],
      etapeActuelleIndex: prochaine !== -1 ? prochaine : activeFixture.etapes.length - 1,
      estTermine,
    };
  })() : internalProg;

  // Utiliser les labels de la carte si disponibles
  const displayFixture = mapState ? {
    ...activeFixture,
    labelDepart: mapState.labelDepart,
    labelArrivee: mapState.labelArrivee,
  } : activeFixture;

  const { pourcentage, distanceRestanteKm, distanceParcourueKm,
          dureeRestanteSecondes, etaTexte, statutsEtapes, estTermine } = progression;

  const containerRef = useRef<HTMLDivElement>(null);

  // Animation flash quand le trajet se termine
  useEffect(() => {
    if (estTermine && containerRef.current) {
      containerRef.current.style.opacity = '0.5';
      const t = setTimeout(() => {
        if (containerRef.current) containerRef.current.style.opacity = '1';
      }, 600);
      return () => clearTimeout(t);
    }
  }, [estTermine]);

  const pctFill = Math.min(pourcentage, 100);

  return (
    <div
      ref={containerRef}
      style={{
        background: C.white,
        border: `1px solid ${C.b}`,
        borderRadius: 16,
        boxShadow: '0 2px 18px rgba(8,49,110,0.09)',
        padding: '20px 26px 18px',
        transition: 'opacity .3s',
      }}
    >
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaMapMarkedAlt size={17} color={C.p} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.p }}>
            {isFR ? 'Progression du trajet' : 'Trip progress'}
          </span>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}>
            {displayFixture.labelDepart} → {displayFixture.labelArrivee}
          </span>
          {estTermine && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: C.gnb, color: C.green, marginLeft: 4,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <FaCheck size={9} /> {isFR ? 'Terminé — nouveau trajet…' : 'Done — next trip…'}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: C.gnb, border: '1px solid rgba(10,173,106,.25)',
          color: C.green, fontSize: 14, fontWeight: 700,
          padding: '5px 14px', borderRadius: 20,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {isFR ? 'Arrivée' : 'Arrival'} : {etaTexte}
        </div>
      </div>

      {/* Piste de progression */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Ligne d'arrière-plan */}
        <div style={{
          position: 'absolute',
          top: 17, left: 17, right: 17, height: 4,
          background: 'rgba(8,49,110,0.08)', borderRadius: 2,
        }} />
        {/* Remplissage de la progression */}
        <div style={{
          position: 'absolute',
          top: 17, left: 17, height: 4,
          width: `calc(${pctFill}% - 34px * ${pctFill / 100})`,
          background: `linear-gradient(90deg, ${C.green}, ${C.p})`,
          borderRadius: 2,
          transition: 'width 1s linear',
        }}>
          {/* Point animé à l'extrémité */}
          {!estTermine && (
            <div style={{
              position: 'absolute', right: -1, top: '50%',
              width: 10, height: 10, borderRadius: '50%',
              background: C.p,
              transform: 'translateY(-50%)',
              boxShadow: `0 0 0 3px rgba(8,49,110,.2)`,
              animation: 'pulse 1.5s ease infinite',
            }} />
          )}
        </div>

        {/* Étapes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          {displayFixture.etapes.map((etape, i) => {
            const statut = statutsEtapes[i] ?? 'en_attente';
            const isDone   = statut === 'fait';
            const isActive = statut === 'actif';
            return (
              <div key={etape.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                  background: isDone ? C.green : isActive ? C.p : C.white,
                  border: isDone || isActive ? 'none' : `2px solid rgba(8,49,110,0.15)`,
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(8,49,110,0.15), 0 2px 10px rgba(8,49,110,0.3)'
                    : isDone
                    ? '0 2px 8px rgba(10,173,106,0.3)'
                    : 'none',
                  animation: isActive ? 'stepPulse 1.8s ease infinite' : 'none',
                  transition: 'all .3s',
                  position: 'relative',
                }}>
                  {isDone ? (
                    <FaCheck size={13} color="#fff" />
                  ) : (
                    <span style={{ color: isActive ? '#fff' : C.muted }}>{etape.icone}</span>
                  )}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.3,
                  maxWidth: 80, color: isDone ? C.green : isActive ? C.p : C.muted,
                }}>
                  {etape.nom}
                </div>
                <div style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>{etape.ville}</div>
                <div style={{
                  fontSize: 11, fontWeight: 700, textAlign: 'center',
                  color: isDone ? C.green : isActive ? C.p : C.muted,
                }}>
                  {isDone
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>{Math.round((etape.tempsSecondes / 60))} min <FaCheck size={8} /></span>
                    : isActive
                    ? (isFR ? 'En route…' : 'En route…')
                    : `~${Math.round(etape.tempsSecondes / 60)} min`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barre de statistiques */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        background: C.bg, border: `1px solid ${C.b}`,
        borderRadius: 10, overflow: 'hidden',
      }}>
        {[
          { v: `${distanceParcourueKm} km`, l: isFR ? 'Parcouru' : 'Traveled',   c: C.green },
          { v: `${distanceRestanteKm} km`,  l: isFR ? 'Restant' : 'Remaining',    c: C.p     },
          { v: `${pctFill.toFixed(0)}%`,    l: isFR ? 'Progression' : 'Progress', c: C.gold  },
          { v: fmt(dureeRestanteSecondes),  l: 'ETA',         c: C.cyan  },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '10px 14px', textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${C.b}` : 'none',
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: s.c }}>
              {s.v}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:translateY(-50%) scale(1)} 50%{opacity:.5;transform:translateY(-50%) scale(1.3)} }
        @keyframes stepPulse {
          0%,100%{box-shadow:0 0 0 4px rgba(8,49,110,0.15),0 2px 10px rgba(8,49,110,0.3)}
          50%{box-shadow:0 0 0 8px rgba(8,49,110,0.08),0 2px 16px rgba(8,49,110,0.2)}
        }
      `}</style>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// Messagerie
// ═══════════════════════════════════════════════════════════════════

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function Messagerie({
  roleMoi,
  correspondants,
  moi,
  activeConversation,
  messagesActifs,
  unreadCounts,
  onSendMessage,
  onSetActiveCorrespondant,
  onBroadcast,
  onRefresh,
}: MessagerieProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Résoudre le correspondant actif : d'abord depuis activeConversation,
  // sinon depuis correspondants[0] (fallback quand aucun message n'existe encore)
  const activeCorrespondantId = activeConversation
    ? (activeConversation.participantIds.find((pid) => pid !== moi.id) ?? (correspondants[0]?.id ?? ''))
    : (correspondants[0]?.id ?? '');
  const correspondantActif = correspondants.find(
    (c) => c.id === activeCorrespondantId,
  );
  const messages = messagesActifs;

  // Scroll interne au conteneur messages — ne tire plus la page vers le bas
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Pré-calcule les IDs de messages qui doivent afficher un séparateur de date
  const dateDividerIds = useMemo(() => {
    const ids = new Set<string>();
    let prev: Date | null = null;
    for (const msg of messages) {
      const d = new Date(msg.timestamp);
      if (!prev || !isSameDay(prev, d)) {
        ids.add(msg.id);
      }
      prev = d;
    }
    return ids;
  }, [messages]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: '#fff',
      justifyContent: 'space-between',
      border: '1px solid rgba(8,49,110,0.09)',
      borderRadius: 16,
      boxShadow: '0 2px 18px rgba(8,49,110,0.09)',
      overflow: 'hidden',
      height: '100%',
      minHeight: 440,
    }}>
      {/* ── En-tête (composant extrait) ── */}
      <ConversationHeader
        roleMoi={roleMoi}
        correspondants={correspondants}
        correspondantActif={correspondantActif}
        activeCorrespondantId={activeCorrespondantId}
        unreadCounts={unreadCounts}
        onSetActiveCorrespondant={onSetActiveCorrespondant}
        onBroadcast={onBroadcast}
        isFR={isFR}
      />

      {/* ── Barre actualisation ── */}
      {onRefresh && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '4px 14px 0',
          marginTop : -8,
          background: '#f7f9fc',
          borderBottom: '1px solid rgba(8,49,110,0.06)',
        }}>
          <button
            onClick={onRefresh}
            title={isFR ? 'Actualiser les messages' : 'Refresh messages'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, color: '#7a90b8',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '3px 0 5px', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <FaSyncAlt size={10} />
            {isFR ? 'Actualiser' : 'Refresh'}
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div ref={messagesContainerRef} style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px',
        marginTop : 0,
        display: 'flex', flexDirection: 'column', gap: 10,
        background: '#f7f9fc', minHeight: 0, maxHeight: 400,
      }}>
        {messages.length === 0 ? (
          /* ── Empty state style WhatsApp ── */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px 20px', gap: 10,
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(8,49,110,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              💬
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0d1f3c', textAlign: 'center' }}>
              {correspondantActif
                ? (isFR ? `Aucun message avec ${correspondantActif.prenom}` : `No messages with ${correspondantActif.prenom}`)
                : (isFR ? 'Aucune conversation' : 'No conversations yet')}
            </div>
            <div style={{ fontSize: 11, color: '#7a90b8', textAlign: 'center', lineHeight: 1.5 }}>
              {isFR
                ? 'Envoyez le premier message pour démarrer la conversation.'
                : 'Send the first message to start the conversation.'}
            </div>
          </div>
        ) : messages.map((msg) => {
          const isMoi = msg.senderId === moi.id;
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMoi={isMoi}
              moi={moi}
              correspondantActif={correspondantActif}
              showDateDivider={dateDividerIds.has(msg.id)}
              isFR={isFR}
            />
          );
        })}
      </div>

      {/* ── Zone de saisie (composant extrait) ── */}
      <MessageInput onSend={onSendMessage} isFR={isFR} />
    </div>
  );
}
