'use client';
// ═══════════════════════════════════════════════════════════════════
// ProgressionSection — Barre de progression temps réel
// Messagerie — Composant de messagerie en temps réel
// ═══════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect, useMemo } from 'react';
import { FaMapMarkedAlt, FaCheck, FaPhone } from 'react-icons/fa';
import { ProgressionSectionProps } from '../types/progression-signalement.types';
import { MessagerieProps } from '../types/messagerie.types';
import { useProgression } from '../hooks/index.hooks';
import { Language, useAppState } from '@/core/state/app_state';

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
  const { fixture: activeFixture, progression: internalProg } = useProgression(fixture);
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Quand mapState est fourni, on dérive la progression depuis l'état de la carte
  const progression = mapState ? (() => {
    const { pourcentageComplete, distanceParcourue, distanceTotaleM, estTermine, vitesseMoyenneKmh } = mapState;
    const distParcourueKm = parseFloat((distanceParcourue / 1000).toFixed(1));
    const distRestanteKm = parseFloat(((distanceTotaleM - distanceParcourue) / 1000).toFixed(1));
    // Temps dérivé de la distance et vitesse — identique au calcul de la carte
    const mPerSec = (vitesseMoyenneKmh * 1000) / 3600;
    const secEcoulees = mPerSec > 0 ? Math.round(distanceParcourue / mPerSec) : 0;
    const secRestantes = mPerSec > 0 ? Math.max(0, Math.round((distanceTotaleM - distanceParcourue) / mPerSec)) : 0;
    const eta = new Date();
    eta.setSeconds(eta.getSeconds() + secRestantes);
    const etaTexte = eta.toLocaleTimeString(isFR ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' });
    // Calculer les statuts d'étapes à partir du temps dérivé
    const statutsEtapes: string[] = activeFixture.etapes.map(() => 'en_attente');
    for (let i = 0; i < activeFixture.etapes.length; i++) {
      if (secEcoulees >= activeFixture.etapes[i].tempsSecondes) statutsEtapes[i] = 'fait';
    }
    const prochaine = activeFixture.etapes.findIndex(e => secEcoulees < e.tempsSecondes);
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

function HourStr(d: Date): string {
  return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function Messagerie({
  roleMoi,
  correspondants,
  moi,
  conversationState,
  onEnvoyerMessage,
  onChangerCorrespondant,
  onBroadcast,
}: MessagerieProps) {
  const [inputVal, setInputVal] = useState('');
  const [showCorrespondants, setShowCorrespondants] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastVal, setBroadcastVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const correspondantActif = correspondants.find(
    (c) => c.id === conversationState.correspondantActifId,
  );
  const messages = useMemo(
    () => conversationState.messages[conversationState.correspondantActifId] ?? [],
    [conversationState.messages, conversationState.correspondantActifId],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    onEnvoyerMessage(inputVal.trim());
    setInputVal('');
  };

  const handleBroadcast = () => {
    if (!broadcastVal.trim()) return;
    onBroadcast(broadcastVal.trim());
    setBroadcastVal('');
    setShowBroadcast(false);
  };

  // Pré-calcule les IDs de messages qui doivent afficher un séparateur de date
  const dateDividerIds = useMemo(() => {
    const ids = new Set<string>();
    let prev: Date | null = null;
    for (const msg of messages) {
      const d = new Date(msg.horodatage);
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
      border: '1px solid rgba(8,49,110,0.09)',
      borderRadius: 16,
      boxShadow: '0 2px 18px rgba(8,49,110,0.09)',
      overflow: 'hidden',
      height: '100%',
      minHeight: 440,
    }}>
      {/* ── En-tête ── */}
      <div style={{
        background: 'linear-gradient(135deg,#051f4a,#0d4490)',
        padding: '12px 16px 10px',
        borderBottom: '1px solid rgba(8,49,110,0.09)',
        flexShrink: 0,
      }}>
        {/* Ligne du haut */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Messages
          </div>
          {/* Boutons conducteur uniquement */}
          {roleMoi === 'driver' && (
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                onClick={() => setShowCorrespondants(!showCorrespondants)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 7, color: 'rgba(255,255,255,0.9)',
                  fontSize: 10, fontWeight: 700, padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {isFR ? 'Passager' : 'Passenger'}
              </button>
              <button
                onClick={() => setShowBroadcast(!showBroadcast)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(200,150,10,0.25)',
                  border: '1px solid rgba(200,150,10,0.4)',
                  borderRadius: 7, color: '#fde68a',
                  fontSize: 10, fontWeight: 700, padding: '5px 10px',
                  cursor: 'pointer',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                {isFR ? 'Tous' : 'All'}
              </button>
            </div>
          )}
        </div>

        {/* Sélection de correspondant (conducteur) */}
        {showCorrespondants && roleMoi === 'driver' && (
          <div style={{
            marginTop: 10,
            background: '#fff',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(8,49,110,.2)',
          }}>
            {correspondants.map((c) => (
              <div
                key={c.id}
                onClick={() => { onChangerCorrespondant(c.id); setShowCorrespondants(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(8,49,110,.06)',
                  background: c.id === conversationState.correspondantActifId
                    ? 'rgba(8,49,110,0.05)' : '#fff',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c.couleurAvatar,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {c.initiales}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0d1f3c' }}>{c.prenom} {c.nom}</div>
                  <div style={{ fontSize: 10, color: '#7a90b8' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: c.estEnLigne ? '#0aad6a' : '#7a90b8', marginRight: 4, verticalAlign: 'middle' }} />
                    {c.estEnLigne ? (isFR ? 'En ligne' : 'Online') : (isFR ? 'Hors ligne' : 'Offline')}
                  </div>
                </div>
                {c.id === conversationState.correspondantActifId && (
                  <span style={{ color: '#0aad6a', fontSize: 12 }}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Panneau de diffusion (broadcast) */}
        {showBroadcast && roleMoi === 'driver' && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              📡 {isFR ? 'Message vers tous les passagers' : 'Message to all passengers'}
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <input
                value={broadcastVal}
                onChange={(e) => setBroadcastVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBroadcast(); }}
                placeholder={isFR ? "Message groupé…" : "Group message…"}
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none',
                  fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleBroadcast}
                style={{
                  padding: '7px 14px', background: '#c8960a',
                  border: 'none', borderRadius: 8, color: '#fff',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {isFR ? 'Envoyer' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Info du correspondant actif + bouton appel */}
        {!showCorrespondants && !showBroadcast && correspondantActif && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: correspondantActif.couleurAvatar,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {correspondantActif.initiales}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {correspondantActif.prenom} {correspondantActif.nom}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: correspondantActif.estEnLigne ? '#0aad6a' : '#7a90b8', display: 'inline-block' }} />
                {correspondantActif.estEnLigne ? (isFR ? 'En ligne' : 'Online') : (isFR ? 'Hors ligne' : 'Offline')} · {correspondantActif.role === 'driver' ? (isFR ? 'Conductrice' : 'Driver') : (isFR ? 'Passager' : 'Passenger')}
              </div>
            </div>
            {/* Bouton appel téléphonique */}
            {correspondantActif.telephone && (
              <a
                href={`tel:${correspondantActif.telephone}`}
                title={`Appeler ${correspondantActif.prenom}`}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#0aad6a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, textDecoration: 'none',
                }}
              >
                <FaPhone size={13} color="#fff" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        background: '#f7f9fc', minHeight: 0,
      }}>
        {messages.map((msg) => {
          const msgDate = new Date(msg.horodatage);
          const showDate = dateDividerIds.has(msg.id);
          const isMoi = msg.role === 'moi';

          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{
                  textAlign: 'center', fontSize: 9, color: '#7a90b8', fontWeight: 600,
                  letterSpacing: '.5px', display: 'flex', alignItems: 'center', gap: 8,
                  margin: '6px 0',
                }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(8,49,110,0.08)' }} />
                  {msgDate.toLocaleDateString(isFR ? 'fr-CA' : 'en-CA', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  <div style={{ flex: 1, height: 1, background: 'rgba(8,49,110,0.08)' }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: isMoi ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: isMoi ? moi.couleurAvatar : (correspondantActif?.couleurAvatar ?? '#08316e'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {isMoi ? moi.initiales : correspondantActif?.initiales}
                </div>
                <div>
                  <div style={{
                    maxWidth: 220,
                    padding: '8px 11px',
                    borderRadius: isMoi ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    fontSize: 12, lineHeight: 1.5,
                    background: isMoi
                      ? 'linear-gradient(135deg,#08316e,#1a5cb0)'
                      : '#fff',
                    color: isMoi ? '#fff' : '#0d1f3c',
                    border: isMoi ? 'none' : '1px solid rgba(8,49,110,0.09)',
                    boxShadow: isMoi
                      ? '0 1px 6px rgba(8,49,110,0.2)'
                      : '0 1px 4px rgba(8,49,110,0.08)',
                  }}>
                    {msg.contenu}
                  </div>
                  <div style={{
                    fontSize: 9, color: '#7a90b8', marginTop: 3,
                    textAlign: isMoi ? 'left' : 'right',
                  }}>
                    {HourStr(new Date(msg.horodatage))}
                    {isMoi && <span style={{ marginLeft: 4 }}>✓</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Zone de saisie ── */}
      <div style={{
        padding: '9px 12px',
        borderTop: '1px solid rgba(8,49,110,0.09)',
        display: 'flex', alignItems: 'flex-end', gap: 8,
        background: '#fff', flexShrink: 0,
      }}>
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={isFR ? "Écrire un message…" : "Write a message…"}
          rows={1}
          style={{
            flex: 1,
            background: '#f0f4fb',
            border: '1.5px solid rgba(8,49,110,0.18)',
            borderRadius: 10, padding: '8px 12px',
            fontSize: 12, fontFamily: 'DM Sans, sans-serif',
            color: '#0d1f3c', outline: 'none', resize: 'none', height: 38,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg,#08316e,#1a5cb0)',
            border: 'none', color: '#fff', fontSize: 15,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
