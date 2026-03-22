'use client';
// ═══════════════════════════════════════════════════════════════════
// SignalementOverlay — Overlay de signalement multi-étapes
// Adaptatif : motifs différents selon la cible choisie.
// ═══════════════════════════════════════════════════════════════════
import { useRef, useEffect, type ReactNode } from 'react';
import {
  FaExclamationTriangle, FaBan, FaAngry, FaBalanceScale, FaMapMarkerAlt,
  FaCar, FaMoneyBillWave, FaUserSlash, FaQuestionCircle, FaClock,
  FaSmokingBan, FaCreditCard, FaWrench, FaRoad, FaBug, FaLock, FaUserTie,
  FaMobileAlt, FaUser, FaClipboardList, FaCheck, FaTimes, FaDownload,
  FaInfoCircle, FaShieldAlt, FaPaperPlane, FaPaperclip, FaFile,
} from 'react-icons/fa';
import { FaLifeRing, FaFaceMeh, FaCircleCheck, FaWineGlass } from 'react-icons/fa6';
import { FiAlertTriangle } from 'react-icons/fi';
import {
  SignalementOverlayProps,
  CibleSignalement,
  NiveauSecurite,
  MotifSignalement,
} from '../types/progression-signalement.types';
import { useSignalement } from '../hooks/index.hooks';
import { Language, useAppState } from '@/core/state/app_state';

// ── Palette ──────────────────────────────────────────────
const C = {
  p: '#08316e', pl: '#1a5cb0', pd: '#051f4a',
  pg: 'rgba(8,49,110,0.07)', pg2: 'rgba(8,49,110,0.13)',
  bg: '#f0f4fb', w: '#fff',
  green: '#0aad6a', gnb: 'rgba(10,173,106,0.1)',
  red: '#e03050', rnb: 'rgba(224,48,80,0.09)', rnd: 'rgba(224,48,80,0.18)',
  gold: '#c8960a', gnl: 'rgba(200,150,10,0.09)',
  muted: '#7a90b8', text: '#0d1f3c',
  b: 'rgba(8,49,110,0.09)', b2: 'rgba(8,49,110,0.18)',
} as const;

// ── Motifs par cible ──────────────────────────────────────
// Fonction bilingue — motifs par cible
const getMOTIFS = (isFR: boolean): Record<CibleSignalement, MotifSignalement[]> => ({
  conducteur: [
    { id: 'conduite-dangereuse',  label: isFR ? 'Conduite dangereuse' : 'Dangerous driving',            description: isFR ? 'Vitesse excessive, téléphone au volant, dépassements risqués, freinages brusques' : 'Speeding, phone use while driving, risky overtaking, sudden braking', icone: <FaExclamationTriangle size={15} color={C.red} />, severite: 'severe'   },
    { id: 'sous-influence',       label: isFR ? 'Conduite sous influence' : 'Driving under influence',   description: isFR ? 'Alcool, drogues ou substances affectant la conduite' : 'Alcohol, drugs or substances affecting driving', icone: <FaWineGlass size={15} color={C.red} />, severite: 'critique' },
    { id: 'harcelement-sexuel',   label: isFR ? 'Harcèlement sexuel' : 'Sexual harassment',              description: isFR ? 'Avances non sollicitées, commentaires déplacés, contact physique non consenti' : 'Unwanted advances, inappropriate comments, non-consensual physical contact', icone: <FaBan size={15} color={C.red} />, severite: 'critique' },
    { id: 'harcelement-verbal',   label: isFR ? 'Harcèlement verbal / Agressivité' : 'Verbal harassment / Aggression', description: isFR ? 'Insultes, menaces, intimidation, comportement hostile' : 'Insults, threats, intimidation, hostile behaviour', icone: <FaAngry size={15} color={C.red} />, severite: 'severe'   },
    { id: 'menace-physique',      label: isFR ? 'Menace ou violence physique' : 'Physical threat or violence', description: isFR ? 'Gestes menaçants, contact physique agressif, intimidation corporelle' : 'Threatening gestures, aggressive physical contact, bodily intimidation', icone: <FiAlertTriangle size={15} color={C.red} />, severite: 'critique' },
    { id: 'discrimination',       label: isFR ? 'Propos discriminatoires' : 'Discriminatory remarks',    description: isFR ? "Propos liés à l'origine, genre, religion, orientation sexuelle, handicap…" : 'Remarks related to origin, gender, religion, sexual orientation, disability…', icone: <FaBalanceScale size={15} color={C.gold} />, severite: 'severe'   },
    { id: 'itineraire',           label: isFR ? 'Itinéraire non respecté' : 'Route not followed',         description: isFR ? 'Détour non consenti, destination modifiée, arrêts non prévus' : 'Unapproved detour, changed destination, unplanned stops', icone: <FaMapMarkerAlt size={15} color={C.p} />, severite: 'modere'   },
    { id: 'vehicule-non-conforme',label: isFR ? 'Véhicule non conforme' : 'Non-compliant vehicle',       description: isFR ? "Différent de l'annonce, sale / insalubre, problèmes mécaniques visibles" : 'Different from listing, dirty / unsanitary, visible mechanical issues', icone: <FaCar size={15} color={C.muted} />, severite: 'modere'   },
    { id: 'tarif-incorrect',      label: isFR ? 'Tarif incorrect' : 'Incorrect fare',                     description: isFR ? "Demande d'argent supplémentaire, prix différent de l'annonce" : 'Request for extra money, price different from listing', icone: <FaMoneyBillWave size={15} color={C.gold} />, severite: 'modere'   },
    { id: 'noshow-conducteur',    label: isFR ? 'Conducteur absent (no-show)' : 'Driver absent (no-show)', description: isFR ? "N'est jamais arrivé au point de rencontre sans annuler" : 'Never arrived at the meeting point without cancelling', icone: <FaUserSlash size={15} color={C.muted} />, severite: 'modere'   },
    { id: 'autre-conducteur',     label: isFR ? 'Autre problème' : 'Other issue',                         description: isFR ? 'Décrivez dans le champ libre' : 'Describe in the text field', icone: <FaQuestionCircle size={15} color={C.muted} />, severite: 'info'     },
  ],
  passager: [
    { id: 'retard-passager',      label: isFR ? 'Retard excessif' : 'Excessive lateness',                 description: isFR ? 'Plus de 15 min sans avertissement' : 'More than 15 min without notice', icone: <FaClock size={15} color={C.gold} />, severite: 'modere'   },
    { id: 'non-respect-regles',   label: isFR ? 'Non-respect des règles du trajet' : 'Violation of trip rules', description: isFR ? 'Fumer dans le véhicule, nourriture/boisson refusée, animaux non déclarés' : 'Smoking in vehicle, refused food/drink, undeclared animals', icone: <FaSmokingBan size={15} color={C.red} />, severite: 'modere'   },
    { id: 'comportement-passager',label: isFR ? 'Comportement inapproprié' : 'Inappropriate behaviour',    description: isFR ? 'Impolitesse, agressivité, harcèlement envers le conducteur ou les autres' : 'Rudeness, aggression, harassment towards driver or others', icone: <FaAngry size={15} color={C.red} />, severite: 'severe'   },
    { id: 'fraude-paiement',      label: isFR ? 'Fraude ou contestation abusive' : 'Fraud or abusive dispute', description: isFR ? 'Contestation injustifiée, tentative de ne pas payer, remboursement injustifié' : 'Unjustified dispute, attempt not to pay, unwarranted refund', icone: <FaCreditCard size={15} color={C.red} />, severite: 'severe'   },
    { id: 'degradation',          label: isFR ? 'Dégradation du véhicule' : 'Vehicle damage',              description: isFR ? 'Dommages intentionnels ou négligents au véhicule' : 'Intentional or negligent damage to the vehicle', icone: <FaWrench size={15} color={C.red} />, severite: 'severe'   },
    { id: 'noshow-passager',      label: isFR ? 'Passager absent (no-show)' : 'Passenger absent (no-show)', description: isFR ? "N'est jamais venu au point de rencontre sans annuler" : 'Never came to the meeting point without cancelling', icone: <FaUserSlash size={15} color={C.muted} />, severite: 'modere'   },
    { id: 'autre-passager',       label: isFR ? 'Autre problème' : 'Other issue',                          description: isFR ? 'Décrivez dans le champ libre' : 'Describe in the text field', icone: <FaQuestionCircle size={15} color={C.muted} />, severite: 'info'     },
  ],
  trajet: [
    { id: 'trajet-fictif',        label: isFR ? 'Trajet fictif / jamais effectué' : 'Fictitious / never completed trip', description: isFR ? 'Paiement prélevé mais trajet non réalisé' : 'Payment charged but trip not completed', icone: <FaBan size={15} color={C.red} />, severite: 'critique' },
    { id: 'montant-incorrect',    label: isFR ? 'Montant prélevé incorrect' : 'Incorrect amount charged',  description: isFR ? 'Différent du prix affiché lors de la réservation' : 'Different from the price shown at booking', icone: <FaCreditCard size={15} color={C.red} />, severite: 'severe'   },
    { id: 'penalite-injustifiee', label: isFR ? 'Pénalité injustifiée appliquée' : 'Unjustified penalty applied', description: isFR ? 'Pénalité prélevée sans raison légitime' : 'Penalty charged without legitimate reason', icone: <FiAlertTriangle size={15} color={C.gold} />, severite: 'modere'   },
    { id: 'itineraire-dangereux', label: isFR ? 'Itinéraire dangereux' : 'Dangerous route',                description: isFR ? 'Route non sécurisée, déviation > 5 km sans accord' : 'Unsafe road, detour > 5 km without agreement', icone: <FaRoad size={15} color={C.red} />, severite: 'severe'   },
    { id: 'autre-trajet',         label: isFR ? 'Autre problème lié au trajet' : 'Other trip-related issue', description: isFR ? 'Non listé ci-dessus' : 'Not listed above', icone: <FaQuestionCircle size={15} color={C.muted} />, severite: 'info'     },
  ],
  plateforme: [
    { id: 'bug-technique',        label: isFR ? 'Bug ou dysfonctionnement' : 'Bug or malfunction',         description: isFR ? 'Crash, page qui ne charge pas, fonctionnalité cassée' : 'Crash, page not loading, broken feature', icone: <FaBug size={15} color={C.muted} />, severite: 'info'     },
    { id: 'erreur-paiement',      label: isFR ? 'Erreur de paiement ou de balance' : 'Payment or balance error', description: isFR ? 'Montant incorrect dans la balance, transaction manquante' : 'Incorrect balance amount, missing transaction', icone: <FaCreditCard size={15} color={C.red} />, severite: 'severe'   },
    { id: 'probleme-compte',      label: isFR ? 'Problème de compte' : 'Account issue',                    description: isFR ? 'Impossible de se connecter, compte bloqué injustement' : 'Unable to log in, account unjustly blocked', icone: <FaLock size={15} color={C.gold} />, severite: 'modere'   },
    { id: 'autre-plateforme',     label: isFR ? 'Autre problème technique' : 'Other technical issue',      description: isFR ? 'Non listé ci-dessus' : 'Not listed above', icone: <FaQuestionCircle size={15} color={C.muted} />, severite: 'info'     },
  ],
});

// Fonction bilingue — niveaux de sévérité
const getSEV_LABELS = (isFR: boolean): Record<string, string> => ({
  critique: isFR ? 'Critique' : 'Critical',
  severe:   isFR ? 'Sévère'  : 'Severe',
  modere:   isFR ? 'Modéré'  : 'Moderate',
  info:     isFR ? 'À évaluer' : 'To evaluate',
});
const SEV_COLORS: Record<string, { bg: string; color: string }> = {
  critique: { bg: C.red,  color: '#fff' },
  severe:   { bg: C.rnd,  color: C.red  },
  modere:   { bg: C.gnl,  color: C.gold },
  info:     { bg: C.pg2,  color: C.p    },
};

// Fonction bilingue — cibles du signalement
const getCIBLES = (isFR: boolean): { id: CibleSignalement; label: string; sub: string; icone: ReactNode }[] => [
  { id: 'conducteur', label: isFR ? 'La conductrice / Le conducteur' : 'The driver', sub: isFR ? 'Conduite, comportement, harcèlement, itinéraire…' : 'Driving, behaviour, harassment, route…', icone: <FaUserTie size={15} color={C.p} /> },
  { id: 'trajet',     label: isFR ? 'Un problème lié au trajet'      : 'A trip-related issue',   sub: isFR ? 'Paiement, itinéraire, trajet fictif…' : 'Payment, route, fictitious trip…', icone: <FaCar size={15} color={C.p} /> },
  { id: 'plateforme', label: isFR ? 'Un problème technique'          : 'A technical issue',      sub: isFR ? 'Bug, paiement incorrect, compte…' : 'Bug, incorrect payment, account…', icone: <FaMobileAlt size={15} color={C.p} /> },
  { id: 'passager',   label: isFR ? 'Un autre passager'              : 'Another passenger',      sub: isFR ? 'Comportement, dégradation…' : 'Behaviour, damage…', icone: <FaUser size={15} color={C.p} /> },
];

// Fonction bilingue — options de sécurité
const getSEV_OPTIONS = (isFR: boolean): { id: NiveauSecurite; label: string; desc: string; icone: ReactNode; bg: string; color: string; badge: string; badgeBg: string }[] => [
  { id: 'danger_immediat', label: isFR ? 'Je suis en danger immédiat'      : 'I am in immediate danger',       desc: isFR ? 'Je me sens menacé(e) physiquement maintenant'            : 'I feel physically threatened right now',      icone: <FaLifeRing size={20} color="#9a2030" />, bg: C.rnb, color: '#9a2030', badge: 'URGENT', badgeBg: C.red   },
  { id: 'incident_recent', label: isFR ? "L'incident vient de se passer"   : 'The incident just happened',     desc: isFR ? "Je ne suis plus en danger mais cela vient d'arriver"     : "I'm no longer in danger but it just occurred", icone: <FaExclamationTriangle size={20} color="#9a2030" />, bg: C.rnb, color: '#9a2030', badge: isFR ? 'Récent' : 'Recent', badgeBg: C.rnd  },
  { id: 'malaise',         label: isFR ? "Je me suis senti(e) mal à l'aise": 'I felt uncomfortable',           desc: isFR ? 'Dérangeant mais pas de danger physique direct'           : 'Disturbing but no direct physical danger',    icone: <FaFaceMeh size={20} color="#8a6000" />, bg: C.gnl, color: '#8a6000', badge: isFR ? 'Modéré' : 'Moderate', badgeBg: C.gold },
  { id: 'informatif',      label: isFR ? 'Signalement informatif'          : 'Informational report',           desc: isFR ? 'Pas de danger — je veux informer la plateforme'          : 'No danger — I want to inform the platform',   icone: <FaClipboardList size={20} color={C.p} />, bg: C.pg,  color: C.p,       badge: 'Info',   badgeBg: C.pg2  },
];

// Fonction bilingue — étiquettes des étapes
const getSTEP_LABELS = (isFR: boolean) => [
  isFR ? 'Cible' : 'Target',
  isFR ? 'Problème' : 'Issue',
  isFR ? 'Sécurité' : 'Safety',
  isFR ? 'Détails' : 'Details',
  isFR ? 'Options' : 'Options',
];

// ── Composant bouton radio réutilisable ──
function Option({
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

// ── Composant principal ──────────────────────────────────
export function SignalementOverlay({
  isOpen, onClose, trajetId, trajetTitre,
  cibleNomParDefaut = 'Julie Tremblay',
  cibleRoleParDefaut,
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
  const CIBLES      = getCIBLES(isFR);
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
            {estSoumis ? <><FaCircleCheck size={14} color={C.green} style={{ marginRight: 6 }} />Signalement envoyé</>
              : etapeActuelle === 1 ? <><FiAlertTriangle size={14} color={C.gold} style={{ marginRight: 6 }} />Signaler un problème</>
              : etapeActuelle === 2 ? <><FiAlertTriangle size={14} color={C.gold} style={{ marginRight: 6 }} />Nature du problème</>
              : etapeActuelle === 3 ? <><FaLifeRing size={14} color={C.red} style={{ marginRight: 6 }} />Évaluation de sécurité</>
              : etapeActuelle === 4 ? <><FaClipboardList size={14} color={C.p} style={{ marginRight: 6 }} />Détails & preuves</>
              : <><FaCircleCheck size={14} color={C.green} style={{ marginRight: 6 }} />Finaliser</>}
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
          ) : (

            <div style={{ padding: '18px 22px 10px' }}>

              {/* Bannière de contexte */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
                background: C.pg, border: `1px solid ${C.b}`, borderRadius: 10, marginBottom: 16, fontSize: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#4a90d9,#a8d8f0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
                }}>JT</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>Trajet {trajetTitre}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>#{trajetId}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: C.gnb, color: C.green }}>
                  {isFR ? 'EN COURS' : 'IN PROGRESS'}
                </span>
              </div>

              {/* ═ ÉTAPE 1 : Cible ═ */}
              {etapeActuelle === 1 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 3, height: 12, background: C.red, borderRadius: 2 }} />
                    {isFR ? 'Que souhaitez-vous signaler ?' : 'What do you want to report?'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {CIBLES.map((c) => (
                      <Option
                        key={c.id}
                        label={c.label}
                        sub={c.sub}
                        icone={c.icone}
                        selected={signalement.cible === c.id}
                        onClick={() => setCible(c.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ═ ÉTAPE 2 : Motif ═ */}
              {etapeActuelle === 2 && signalement.cible && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.p, letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 3, height: 12, background: C.red, borderRadius: 2 }} />
                    {isFR ? 'Quel est le problème précis ?' : 'What is the exact problem?'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {(MOTIFS[signalement.cible] ?? []).map((m) => {
                      const sc = SEV_COLORS[m.severite];
                      return (
                        <Option
                          key={m.id}
                          label={m.label}
                          sub={m.description}
                          icone={m.icone}
                          selected={signalement.motifId === m.id}
                          onClick={() => setMotif(m.id, m.label)}
                          badge={SEV_LABELS[m.severite]}
                          badgeBg={sc.bg}
                          badgeColor={sc.color}
                        />
                      );
                    })}
                  </div>
                </div>
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
                <div>
                  {/* Résumé */}
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

                  {/* Note GPS */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px',
                    background: C.pg, borderLeft: `3px solid ${C.p}`,
                    borderRadius: '0 8px 8px 0', fontSize: 11, color: C.p, lineHeight: 1.6,
                  }}>
                    <FaInfoCircle size={12} style={{ flexShrink: 0, marginRight: 4 }} /> {isFR ? 'Le journal GPS complet du trajet sera automatiquement joint comme preuve objective.' : 'The full GPS log of the trip will be automatically attached as objective evidence.'}
                  </div>
                </div>
              )}

              {/* ═ ÉTAPE 5 : Options + Récap ═ */}
              {etapeActuelle === 5 && (
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
                      {/* Interrupteur */}
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
                      { k: isFR ? 'Sécurité' : 'Safety',          v: SEV_OPTIONS.find((s) => s.id === signalement.niveauSecurite)?.label ?? '—' },
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
