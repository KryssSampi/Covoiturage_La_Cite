'use client';
// ═══════════════════════════════════════════════════════════════════
// Données et constantes pour SignalementOverlay
// Palette, motifs, cibles, niveaux de sécurité, Option radio.
// ═══════════════════════════════════════════════════════════════════
import type { ReactNode } from 'react';
import {
  FaExclamationTriangle, FaBan, FaAngry, FaBalanceScale, FaMapMarkerAlt,
  FaCar, FaMoneyBillWave, FaUserSlash, FaQuestionCircle, FaClock,
  FaSmokingBan, FaCreditCard, FaWrench, FaRoad, FaBug, FaLock, FaUserTie,
  FaMobileAlt, FaUser, FaClipboardList,
} from 'react-icons/fa';
import { FaLifeRing, FaFaceMeh, FaWineGlass } from 'react-icons/fa6';
import { FiAlertTriangle } from 'react-icons/fi';
import type {
  CibleSignalement,
  NiveauSecurite,
  MotifSignalement,
} from '../types/progression-signalement.types';

// ── Palette ──────────────────────────────────────────────
export const C = {
  p: '#08316e', pl: '#1a5cb0', pd: '#051f4a',
  pg: 'rgba(8,49,110,0.07)', pg2: 'rgba(8,49,110,0.13)',
  bg: '#f0f4fb', w: '#fff',
  green: '#0aad6a', gnb: 'rgba(10,173,106,0.1)',
  red: '#e03050', rnb: 'rgba(224,48,80,0.09)', rnd: 'rgba(224,48,80,0.18)',
  gold: '#c8960a', gnl: 'rgba(200,150,10,0.09)',
  muted: '#7a90b8', text: '#0d1f3c',
  b: 'rgba(8,49,110,0.09)', b2: 'rgba(8,49,110,0.18)',
} as const;

// ── Motifs par cible (bilingue) ──────────────────────────
export const getMOTIFS = (isFR: boolean): Record<CibleSignalement, MotifSignalement[]> => ({
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

// ── Sévérité : labels et couleurs ────────────────────────
export const getSEV_LABELS = (isFR: boolean): Record<string, string> => ({
  critique: isFR ? 'Critique' : 'Critical',
  severe:   isFR ? 'Sévère'  : 'Severe',
  modere:   isFR ? 'Modéré'  : 'Moderate',
  info:     isFR ? 'À évaluer' : 'To evaluate',
});
export const SEV_COLORS: Record<string, { bg: string; color: string }> = {
  critique: { bg: C.red,  color: '#fff' },
  severe:   { bg: C.rnd,  color: C.red  },
  modere:   { bg: C.gnl,  color: C.gold },
  info:     { bg: C.pg2,  color: C.p    },
};

// ── Cibles du signalement ────────────────────────────────
export const getCIBLES = (
  isFR: boolean,
  role?: 'driver' | 'passenger',
): { id: CibleSignalement; label: string; sub: string; icone: ReactNode }[] => {
  const all: { id: CibleSignalement; label: string; sub: string; icone: ReactNode }[] = [
    { id: 'conducteur', label: isFR ? 'La conductrice / Le conducteur' : 'The driver',       sub: isFR ? 'Conduite, comportement, harcèlement, itinéraire…' : 'Driving, behaviour, harassment, route…', icone: <FaUserTie size={15} color={C.p} /> },
    { id: 'passager',   label: isFR ? 'Un passager du trajet'          : 'A trip passenger', sub: isFR ? 'Comportement, retard, dégradation…' : 'Behaviour, lateness, damage…',                icone: <FaUser    size={15} color={C.p} /> },
    { id: 'trajet',     label: isFR ? 'Un problème lié au trajet'      : 'A trip-related issue', sub: isFR ? 'Paiement, itinéraire, trajet fictif…' : 'Payment, route, fictitious trip…',        icone: <FaCar     size={15} color={C.p} /> },
    { id: 'plateforme', label: isFR ? 'Un problème technique'          : 'A technical issue',    sub: isFR ? 'Bug, paiement incorrect, compte…' : 'Bug, incorrect payment, account…',            icone: <FaMobileAlt size={15} color={C.p} /> },
  ];

  if (role === 'driver') {
    // Le conducteur ne peut pas se signaler lui-même → retire la cible 'conducteur'
    return all.filter((c) => c.id !== 'conducteur');
  }
  if (role === 'passenger') {
    // Le passager signale en priorité le conducteur, puis les autres cibles
    return [
      all.find((c) => c.id === 'conducteur')!,
      all.find((c) => c.id === 'trajet')!,
      all.find((c) => c.id === 'plateforme')!,
      all.find((c) => c.id === 'passager')!,
    ];
  }
  return all;
};

// ── Options de niveau de sécurité ────────────────────────
export const getSEV_OPTIONS = (isFR: boolean): { id: NiveauSecurite; label: string; desc: string; icone: ReactNode; bg: string; color: string; badge: string; badgeBg: string }[] => [
  { id: 'danger_immediat', label: isFR ? 'Je suis en danger immédiat'      : 'I am in immediate danger',       desc: isFR ? 'Je me sens menacé(e) physiquement maintenant'            : 'I feel physically threatened right now',      icone: <FaLifeRing size={20} color="#9a2030" />, bg: C.rnb, color: '#9a2030', badge: 'URGENT', badgeBg: C.red   },
  { id: 'incident_recent', label: isFR ? "L'incident vient de se passer"   : 'The incident just happened',     desc: isFR ? "Je ne suis plus en danger mais cela vient d'arriver"     : "I'm no longer in danger but it just occurred", icone: <FaExclamationTriangle size={20} color="#9a2030" />, bg: C.rnb, color: '#9a2030', badge: isFR ? 'Récent' : 'Recent', badgeBg: C.rnd  },
  { id: 'malaise',         label: isFR ? "Je me suis senti(e) mal à l'aise": 'I felt uncomfortable',           desc: isFR ? 'Dérangeant mais pas de danger physique direct'           : 'Disturbing but no direct physical danger',    icone: <FaFaceMeh size={20} color="#8a6000" />, bg: C.gnl, color: '#8a6000', badge: isFR ? 'Modéré' : 'Moderate', badgeBg: C.gold },
  { id: 'informatif',      label: isFR ? 'Signalement informatif'          : 'Informational report',           desc: isFR ? 'Pas de danger — je veux informer la plateforme'          : 'No danger — I want to inform the platform',   icone: <FaClipboardList size={20} color={C.p} />, bg: C.pg,  color: C.p,       badge: 'Info',   badgeBg: C.pg2  },
];

// ── Labels des étapes ────────────────────────────────────
export const getSTEP_LABELS = (isFR: boolean) => [
  isFR ? 'Cible' : 'Target',
  isFR ? 'Problème' : 'Issue',
  isFR ? 'Sécurité' : 'Safety',
  isFR ? 'Détails' : 'Details',
  isFR ? 'Options' : 'Options',
];

// Le composant Option a été déplacé dans signalement/SignalementStepSelector.tsx
