'use client';
// ═══════════════════════════════════════════════════════════════════
// SignalementOverlay — Overlay de signalement multi-étapes
// Adaptatif : motifs différents selon la cible choisie.
// ═══════════════════════════════════════════════════════════════════
import { useRef, useEffect } from 'react';
import {
  FaExclamationTriangle, FaCheck, FaTimes, FaPaperPlane, FaClipboardList,
} from 'react-icons/fa';
import { FaLifeRing, FaCircleCheck } from 'react-icons/fa6';
import { FiAlertTriangle } from 'react-icons/fi';
import { SignalementOverlayProps } from '../types/progression-signalement.types';
import { useSignalement } from '../hooks/useSignalement';
import { Language, useAppState } from '@/core/state/app_state';

// Sous-composants et données extraits
import {
  C, getMOTIFS, getSEV_LABELS, SEV_COLORS, getCIBLES,
  getSEV_OPTIONS, getSTEP_LABELS,
} from './signalement-overlay-data';
import {
  SignalementConfirmation,
  SignalementStepDetails,
  SignalementStepOptions,
  SignalementStepSelector,
} from './signalement';


// ── Composant principal ──────────────────────────────────
export function SignalementOverlay({
  isOpen, onClose, trajetId, trajetTitre,
  cibleNomParDefaut = '',
  cibleRoleParDefaut,
  role,
}: SignalementOverlayProps) {
  const hook = useSignalement(trajetId, cibleNomParDefaut, cibleRoleParDefaut);
  const {
    etapeActuelle, signalement, estSoumis, referenceSignalement, peutContinuer,
    setCible, setMotif, setNiveauSecurite, setDescription, setHeureIncident,
    ajouterPreuve, supprimerPreuve, setOption,
    suivant, precedent, soumettre, reinitialiser, telechargerPDF,
  } = hook;

  // Langue courante
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Constantes bilingues instanciées
  const MOTIFS      = getMOTIFS(isFR);
  const SEV_LABELS  = getSEV_LABELS(isFR);
  const CIBLES      = getCIBLES(isFR, role);
  const SEV_OPTIONS = getSEV_OPTIONS(isFR);
  const STEP_LABELS = getSTEP_LABELS(isFR);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [etapeActuelle]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(5,22,50,0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: C.w, borderRadius: 20,
        boxShadow: '0 24px 70px rgba(5,22,50,0.3)',
        width: '100%', maxWidth: 540,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp .3s ease',
      }}>
        {/* ── Piste de progression ── */}
        {!estSoumis && (
          <div style={{ padding: '16px 22px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEP_LABELS.map((lbl, i) => {
                const step = i + 1;
                const isDone   = etapeActuelle > step;
                const isActive = etapeActuelle === step;
                return (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: isDone ? C.green : isActive ? C.red : C.bg,
                        border: `2px solid ${isDone ? C.green : isActive ? C.red : C.b2}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 11,
                        color: isDone || isActive ? '#fff' : C.muted,
                        transition: '.3s',
                      }}>
                        {isDone ? <FaCheck size={11} color="#fff" /> : step}
                      </div>
                      <div style={{
                        fontSize: 9, fontWeight: 600,
                        color: isDone ? C.green : isActive ? C.red : C.muted,
                        whiteSpace: 'nowrap',
                      }}>
                        {lbl}
                      </div>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div style={{
                        flex: 1, height: 2, background: isDone ? C.green : C.b,
                        borderRadius: 1, margin: '0 4px 14px',
                        transition: 'background .3s',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Ligne de titre ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 22px 14px',
          borderBottom: `1px solid ${C.b}`,
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.text }}>
            {estSoumis ? <><FaCircleCheck size={14} color={C.green} style={{ marginRight: 6 }} />{isFR ? 'Signalement envoyé' : 'Report sent'}</>
              : etapeActuelle === 1 ? <><FiAlertTriangle size={14} color={C.gold} style={{ marginRight: 6 }} />{isFR ? 'Signaler un problème' : 'Report an issue'}</>
              : etapeActuelle === 2 ? <><FiAlertTriangle size={14} color={C.gold} style={{ marginRight: 6 }} />{isFR ? 'Nature du problème' : 'Nature of the problem'}</>
              : etapeActuelle === 3 ? <><FaLifeRing size={14} color={C.red} style={{ marginRight: 6 }} />{isFR ? 'Évaluation de sécurité' : 'Safety assessment'}</>
              : etapeActuelle === 4 ? <><FaClipboardList size={14} color={C.p} style={{ marginRight: 6 }} />{isFR ? 'Détails & preuves' : 'Details & evidence'}</>
              : <><FaCircleCheck size={14} color={C.green} style={{ marginRight: 6 }} />{isFR ? 'Finaliser' : 'Finalize'}</>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!estSoumis && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                background: C.bg, border: `1px solid ${C.b}`, color: C.muted,
              }}>
                {isFR ? `Étape ${etapeActuelle} / 5` : `Step ${etapeActuelle} / 5`}
              </span>
            )}
            <button
              onClick={() => { onClose(); reinitialiser(); }}
              style={{
                width: 28, height: 28, borderRadius: 7, border: 'none',
                background: C.bg, cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
              }}
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>

        {/* ── Corps ── */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

          {/* ═ CONFIRMATION ═ */}
          {estSoumis ? (
            <SignalementConfirmation
              referenceSignalement={referenceSignalement}
              telechargerPDF={telechargerPDF}
              onClose={onClose}
              reinitialiser={reinitialiser}
              isFR={isFR}
            />
          ) : (

            <div style={{ padding: '18px 22px 10px' }}>

              {/* Bannière de contexte */}
              {(() => {
                const initials = cibleNomParDefaut
                  ? cibleNomParDefaut.trim().split(/\s+/).map((n) => n[0]?.toUpperCase() ?? '').slice(0, 2).join('')
                  : (role === 'driver' ? 'P' : role === 'passenger' ? 'C' : '?');
                const roleLabel = role === 'driver'
                  ? (isFR ? 'Conducteur' : 'Driver')
                  : role === 'passenger'
                    ? (isFR ? 'Passager' : 'Passenger')
                    : '';
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
                    background: C.pg, border: `1px solid ${C.b}`, borderRadius: 10, marginBottom: 16, fontSize: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: role === 'driver'
                        ? 'linear-gradient(135deg,#0aad6a,#07855a)'
                        : 'linear-gradient(135deg,#4a90d9,#a8d8f0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>
                        {cibleNomParDefaut || (isFR ? 'Trajet ' + trajetTitre : 'Trip ' + trajetTitre)}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                        {roleLabel && <span style={{ marginRight: 6, fontWeight: 600 }}>{roleLabel}</span>}
                        #{trajetId}
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: C.gnb, color: C.green }}>
                      {isFR ? 'EN COURS' : 'IN PROGRESS'}
                    </span>
                  </div>
                );
              })()}

              {/* ═ ÉTAPE 1 : Cible ═ */}
              {etapeActuelle === 1 && (
                <SignalementStepSelector
                  options={CIBLES.map((c) => ({
                    id: c.id,
                    label: c.label,
                    sub: c.sub,
                    icone: c.icone,
                  }))}
                  selectedId={signalement.cible}
                  onSelect={(id) => setCible(id as Exclude<typeof signalement.cible, null>)}
                  title={isFR ? 'Que souhaitez-vous signaler ?' : 'What do you want to report?'}
                />
              )}

              {/* ═ ÉTAPE 2 : Motif ═ */}
              {etapeActuelle === 2 && signalement.cible && (
                <SignalementStepSelector
                  options={(MOTIFS[signalement.cible] ?? []).map((m) => {
                    const sc = SEV_COLORS[m.severite];
                    return {
                      id: m.id,
                      label: m.label,
                      sub: m.description,
                      icone: m.icone,
                      badge: SEV_LABELS[m.severite],
                      badgeBg: sc.bg,
                      badgeColor: sc.color,
                    };
                  })}
                  selectedId={signalement.motifId}
                  onSelect={(id) => {
                    const motif = (MOTIFS[signalement.cible!] ?? []).find((m) => m.id === id);
                    if (motif) setMotif(motif.id, motif.label);
                  }}
                  title={isFR ? 'Quel est le problème précis ?' : 'What is the exact problem?'}
                />
              )}

              {/* ═ ÉTAPE 3 : Sécurité ═ */}
              {etapeActuelle === 3 && (
                <div>
                  {/* Bannière SOS */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    background: C.rnb, border: `1.5px solid rgba(224,48,80,.2)`,
                    borderRadius: 10, marginBottom: 14, fontSize: 12, color: '#9a2030', lineHeight: 1.6,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}><FaLifeRing size={18} color="#9a2030" /></span>
                    <div>
                      <strong>{isFR ? 'Êtes-vous en danger immédiat ?' : 'Are you in immediate danger?'}</strong><br />
                      {isFR ? "N'attendez pas — appelez le 911 ou activez le bouton SOS." : "Don't wait — call 911 or activate the SOS button."}
                      <br />
                      <button
                        onClick={onClose}
                        style={{
                          marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 7,
                          padding: '7px 14px', background: C.red, color: '#fff', border: 'none',
                          borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        <FaExclamationTriangle size={12} style={{ marginRight: 4 }} /> {isFR ? 'Activer le SOS' : 'Activate SOS'}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 3, height: 12, background: C.red, borderRadius: 2 }} />
                    {isFR ? 'Évaluation de la situation' : 'Situation assessment'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {SEV_OPTIONS.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setNiveauSecurite(s.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                          background: signalement.niveauSecurite === s.id ? s.bg : C.bg,
                          border: `1.5px solid ${signalement.niveauSecurite === s.id ? C.red : C.b}`,
                          borderRadius: 10, cursor: 'pointer', transition: '.15s',
                        }}
                      >
                        <span style={{ fontSize: 22, width: 40, textAlign: 'center', flexShrink: 0 }}>{s.icone}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{s.label}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 5,
                          background: s.badgeBg, color: typeof s.badgeBg === 'string' && s.badgeBg === C.red ? '#fff' : C.text,
                          flexShrink: 0,
                        }}>{s.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═ ÉTAPE 4 : Détails ═ */}
              {etapeActuelle === 4 && (
                <SignalementStepDetails
                  signalement={signalement}
                  setDescription={setDescription}
                  setHeureIncident={setHeureIncident}
                  ajouterPreuve={ajouterPreuve}
                  supprimerPreuve={supprimerPreuve}
                  isFR={isFR}
                />
              )}

              {/* ═ ÉTAPE 5 : Options + Récap ═ */}
              {etapeActuelle === 5 && (
                <SignalementStepOptions
                  signalement={signalement}
                  setOption={setOption}
                  sevOptions={SEV_OPTIONS}
                  isFR={isFR}
                />
              )}

            </div>
          )}
        </div>

        {/* ── Pied de page ── */}
        {!estSoumis && (
          <div style={{
            padding: '13px 22px 18px',
            borderTop: `1px solid ${C.b}`,
            display: 'flex', gap: 9,
            background: C.w, flexShrink: 0,
          }}>
            {etapeActuelle > 1 && (
              <button
                onClick={precedent}
                style={{
                  padding: '11px 18px',
                  background: C.w, color: C.muted,
                  border: `1.5px solid ${C.b2}`, borderRadius: 10,
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                ← {isFR ? 'Retour' : 'Back'}
              </button>
            )}

            {etapeActuelle < 5 ? (
              <button
                onClick={suivant}
                disabled={!peutContinuer}
                style={{
                  flex: 1, padding: 12,
                  background: peutContinuer
                    ? `linear-gradient(135deg,${C.p},${C.pl})`
                    : C.b,
                  color: peutContinuer ? '#fff' : C.muted,
                  border: 'none', borderRadius: 10,
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
                  cursor: peutContinuer ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}
              >
                {isFR ? 'Continuer' : 'Continue'} →
              </button>
            ) : (
              <button
                onClick={soumettre}
                style={{
                  flex: 1, padding: 12,
                  background: `linear-gradient(135deg,${C.red},#c01838)`,
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}
              >
                <FaPaperPlane size={12} style={{ marginRight: 4 }} /> {isFR ? 'Envoyer le signalement' : 'Send report'}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(22px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes popIn   { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}
