'use client';
// ─────────────────────────────────────────────
// Données fictives pour la feature "Trajet en cours"
// ─────────────────────────────────────────────
import React from 'react';
import {
  FaGem, FaClock, FaShieldAlt, FaSmile, FaLeaf,
  FaGraduationCap, FaBuilding, FaMapMarkerAlt, FaHome, FaFlagCheckered,
  FaSchool, FaHardHat, FaStore, FaTree,
} from 'react-icons/fa';
import { TrajetEnCoursData } from '../types/trajet-en-cours.types';

// Rôle actuel — basculer entre 'driver' et 'passenger' pour changer le point de vue
export const ROLE_ACTUEL: 'driver' | 'passenger' = 'driver';

export const trajetFixture: TrajetEnCoursData = {
  id: 'TRJ-2026-08842',
  titre: 'Campus La Cité — Place d\'Orléans',
  role: ROLE_ACTUEL,
  conducteur: {
    id: 'USR-JT-001',
    prenom: 'Julie',
    nom: 'Tremblay',
    initiales: 'JT',
    note: 4.5,
    nbTrajets: 60,
    nbTrajetsEnsemble: 14,
    estVerifie: true,
    telephone: '+1 613 555 0123',
    badges: [
      { id: 'expert',      icone: React.createElement(FaGem, { size: 12, color: '#6c5ce7' }), label: 'Expert' },
      { id: 'ponctuel',    icone: React.createElement(FaClock, { size: 12, color: '#0aad6a' }), label: 'Ponctuelle' },
      { id: 'fiable',      icone: React.createElement(FaShieldAlt, { size: 12, color: '#08316e' }), label: 'Fiable' },
      { id: 'sympathique', icone: React.createElement(FaSmile, { size: 12, color: '#f39c12' }), label: 'Sympathique' },
      { id: 'eco',         icone: React.createElement(FaLeaf, { size: 12, color: '#0aad6a' }), label: 'Éco-Consciente' },
    ],
    vehicule: {
      marque: 'Honda',
      modele: 'Civic',
      annee: 2020,
      couleur: 'Noire',
      immatriculation: 'ABC-1234',
      nbPlaces: 4,
    },
  },
  passagers: [
    {
      id: 'USR-AI-100',
      prenom: 'Ahmed',
      nom: 'Ibrahim',
      initiales: 'AI',
      couleurAvatar: 'linear-gradient(135deg,#08316e,#1a5cb0)',
      note: 4.9,
      place: 1,
      telephone: '+1 613 555 0200',
    },
    {
      id: 'USR-PD-101',
      prenom: 'Pauline',
      nom: 'Dubois',
      initiales: 'PD',
      couleurAvatar: 'linear-gradient(135deg,#8a3a1a,#e08040)',
      note: 5.0,
      place: 2,
      telephone: '+1 613 555 0201',
    },
    {
      id: 'USR-KB-102',
      prenom: 'Karima',
      nom: 'Belkhadem',
      initiales: 'KB',
      couleurAvatar: 'linear-gradient(135deg,#1a3a8a,#4070e0)',
      note: 4.7,
      place: 3,
      telephone: '+1 613 555 0202',
    },
  ],
  depart: {
    nom: 'Campus La Cité',
    adresse: '801 promenade de l\'Aviation, Ottawa, ON K1K 4R3',
    coordonnees: { lat: 45.4215, lng: -75.6830 },
    instructions: 'Rendez-vous devant l\'entrée principale, près du stationnement A.',
  },
  arrivee: {
    nom: 'Place d\'Orléans',
    adresse: '110 Place d\'Orléans Dr, Orléans, ON K1C 2L9',
    coordonnees: { lat: 45.4590, lng: -75.5210 },
    instructions: 'Rendez-vous devant l\'entrée principale de Place d\'Orléans.',
  },
  preferences: {
    bagagesAutorises: true,
    animauxAcceptes: true,
    fumeur: false,
    musique: false,
    niveauConversation: 'modere',
    messagePassagers: 'Départ devant la principale.',
  },
  statut: {
    etat: 'en_cours',
    typeDepart: 'unique',
    estRecurrent: false,
    detourMaxMin: 10,
    modePaiement: 'comptant',
    nbPlacesDisponibles: 3,
    nbPlacesTotales: 4,
    derniereMaj: new Date('2026-03-19T20:16:00'),
  },
  tarif: {
    prixParPassager: 6,
    economieVsTaxi: 22,
    co2EconomiseKg: 11.7,
  },
  dateDepart: '20 mars 2026',
  heureDepart: '08h30',
};


// ─────────────────────────────────────────────
// Données fictives — messagerie
// ─────────────────────────────────────────────
import { Correspondant, Conversation, MoiInfo, buildConversationId } from '../types/messagerie.types';

export const moiFixture: MoiInfo = {
  id: 'USR-AI-100',
  prenom: 'Ahmed',
  nom: 'Ibrahim',
  initiales: 'AI',
  couleurAvatar: 'linear-gradient(135deg, #08316e, #1a5cb0)',
};

// Un seul correspondant pour le passager : le conducteur
export const correspondantsPassagerFixture: Correspondant[] = [
  {
    id: 'USR-JT-001',
    prenom: 'Julie',
    nom: 'Tremblay',
    initiales: 'JT',
    role: 'driver',
    estEnLigne: true,
    couleurAvatar: 'linear-gradient(135deg, #4a90d9, #a8d8f0)',
    telephone: '+1 613 555 0123',
  },
];

// Tous les passagers pour le conducteur
export const correspondantsConducteurFixture: Correspondant[] = [
  {
    id: 'USR-AI-100',
    prenom: 'Ahmed',
    nom: 'Ibrahim',
    initiales: 'AI',
    role: 'passenger',
    estEnLigne: true,
    couleurAvatar: 'linear-gradient(135deg, #08316e, #1a5cb0)',
    telephone: '+1 613 555 0200',
  },
  {
    id: 'USR-PD-101',
    prenom: 'Pauline',
    nom: 'Dubois',
    initiales: 'PD',
    role: 'passenger',
    estEnLigne: false,
    couleurAvatar: 'linear-gradient(135deg, #8a3a1a, #e08040)',
    telephone: '+1 613 555 0201',
  },
  {
    id: 'USR-KB-102',
    prenom: 'Karima',
    nom: 'Belkhadem',
    initiales: 'KB',
    role: 'passenger',
    estEnLigne: true,
    couleurAvatar: 'linear-gradient(135deg, #1a3a8a, #4070e0)',
    telephone: '+1 613 555 0202',
  },
];

// IDs de référence pour les fixtures
const ID_DRIVER  = 'USR-JT-001';
const ID_PAX_AI  = 'USR-AI-100';
const ID_PAX_PD  = 'USR-PD-101';
const ID_PAX_KB  = 'USR-KB-102';

const CONV_JT_AI = buildConversationId(ID_DRIVER, ID_PAX_AI); // conv_USR-AI-100_USR-JT-001
const CONV_JT_PD = buildConversationId(ID_DRIVER, ID_PAX_PD); // conv_USR-JT-001_USR-PD-101
const CONV_JT_KB = buildConversationId(ID_DRIVER, ID_PAX_KB); // conv_USR-JT-001_USR-KB-102

/** Conversations initiales utilisées par le hook useMessagerie */
export const conversationsInitialesFixture: Conversation[] = [
  {
    id: CONV_JT_AI,
    participantIds: [ID_DRIVER, ID_PAX_AI],
    createdAt: '2026-03-20T03:30:00.000Z',
    updatedAt: '2026-03-20T03:45:00.000Z',
    messages: [
      { id: 'msg-001', conversationId: CONV_JT_AI, senderId: ID_DRIVER, receiverId: ID_PAX_AI,  content: "Salut, je suis devant l'entrée principale. À tout de suite 😊", timestamp: '2026-03-20T03:30:00.000Z', isRead: true,  type: 'text' },
      { id: 'msg-002', conversationId: CONV_JT_AI, senderId: ID_PAX_AI,  receiverId: ID_DRIVER, content: "Super ! J'arrive dans 2 minutes 👍",                            timestamp: '2026-03-20T03:31:00.000Z', isRead: true,  type: 'text' },
      { id: 'msg-003', conversationId: CONV_JT_AI, senderId: ID_DRIVER, receiverId: ID_PAX_AI,  content: 'Je suis garée à gauche de l\'entrée, Honda Civic noire 🚗',    timestamp: '2026-03-20T03:32:00.000Z', isRead: true,  type: 'text' },
      { id: 'msg-004', conversationId: CONV_JT_AI, senderId: ID_PAX_AI,  receiverId: ID_DRIVER, content: 'Je vous vois ! Je sors maintenant.',                           timestamp: '2026-03-20T03:33:00.000Z', isRead: true,  type: 'text' },
      { id: 'msg-005', conversationId: CONV_JT_AI, senderId: ID_DRIVER, receiverId: ID_PAX_AI,  content: 'On est presque arrivés ! Encore ~10 min. 🏁',                  timestamp: '2026-03-20T03:45:00.000Z', isRead: false, type: 'text' },
    ],
  },
  {
    id: CONV_JT_PD,
    participantIds: [ID_DRIVER, ID_PAX_PD],
    createdAt: '2026-03-20T03:15:00.000Z',
    updatedAt: '2026-03-20T03:16:00.000Z',
    messages: [
      { id: 'msg-pd-001', conversationId: CONV_JT_PD, senderId: ID_PAX_PD, receiverId: ID_DRIVER, content: 'Bonjour, je serai là à l\'heure 😊', timestamp: '2026-03-20T03:15:00.000Z', isRead: true, type: 'text' },
      { id: 'msg-pd-002', conversationId: CONV_JT_PD, senderId: ID_DRIVER, receiverId: ID_PAX_PD, content: 'Parfait, à tout à l\'heure !',       timestamp: '2026-03-20T03:16:00.000Z', isRead: true, type: 'text' },
    ],
  },
  {
    id: CONV_JT_KB,
    participantIds: [ID_DRIVER, ID_PAX_KB],
    createdAt: '2026-03-20T03:00:00.000Z',
    updatedAt: '2026-03-20T03:00:00.000Z',
    messages: [],
  },
];


// ─────────────────────────────────────────────
// Données fictives — progression
// ─────────────────────────────────────────────
import { TrajetProgressionFixture } from '../types/progression-signalement.types';

export const progressionFixture: TrajetProgressionFixture = {
  id: 'TRJ-2026-08842',
  labelDepart: 'Campus La Cité',
  labelArrivee: 'Place d\'Orléans',
  dureeTotaleSecondes: 18 * 60,
  distanceTotaleKm: 16.8,
  etapes: [
    { id: 'e1', nom: 'Campus La Cité',  ville: 'Ottawa, ON',  icone: React.createElement(FaGraduationCap, { size: 13, color: '#08316e' }), tempsSecondes: 0,        distanceKm: 0    },
    { id: 'e2', nom: 'Vanier',           ville: 'Ottawa',      icone: React.createElement(FaBuilding, { size: 13, color: '#7a90b8' }),       tempsSecondes: 6 * 60,  distanceKm: 5.6  },
    { id: 'e3', nom: 'Blackburn Hamlet', ville: 'Ottawa Est',  icone: React.createElement(FaMapMarkerAlt, { size: 13, color: '#e03050' }),   tempsSecondes: 11 * 60, distanceKm: 10.2 },
    { id: 'e4', nom: 'Gloucester',       ville: 'Ottawa',      icone: React.createElement(FaHome, { size: 13, color: '#7a90b8' }),           tempsSecondes: 15 * 60, distanceKm: 14.0 },
    { id: 'e5', nom: 'Place d\'Orléans', ville: 'Orléans, ON', icone: React.createElement(FaFlagCheckered, { size: 13, color: '#0aad6a' }),  tempsSecondes: 18 * 60, distanceKm: 16.8 },
  ],
};

/** Génère une nouvelle fixture aléatoire quand le trajet se termine */
export function genererNouvelleProgression(): TrajetProgressionFixture {
  const duree  = (Math.floor(Math.random() * 22) + 8) * 60;
  const dist   = parseFloat((Math.random() * 22 + 5).toFixed(1));
  const nEtapes = Math.floor(Math.random() * 3) + 3;

  const villesPool = ['Barrhaven','Kanata','Nepean','Aylmer','Hull','Rockcliffe','Gloucester','Vanier','Manor Park'];
  const iconesPool = [
    React.createElement(FaBuilding, { size: 13, color: '#7a90b8' }),
    React.createElement(FaHome, { size: 13, color: '#7a90b8' }),
    React.createElement(FaMapMarkerAlt, { size: 13, color: '#e03050' }),
    React.createElement(FaSchool, { size: 13, color: '#08316e' }),
    React.createElement(FaHardHat, { size: 13, color: '#c8960a' }),
    React.createElement(FaStore, { size: 13, color: '#7a90b8' }),
    React.createElement(FaTree, { size: 13, color: '#0aad6a' }),
  ];

  const etapes: TrajetProgressionFixture['etapes'] = [
    { id: 'e1', nom: 'Campus La Cité', ville: 'Ottawa, ON', icone: React.createElement(FaGraduationCap, { size: 13, color: '#08316e' }), tempsSecondes: 0, distanceKm: 0 },
  ];

  for (let i = 1; i < nEtapes - 1; i++) {
    const ratio = i / (nEtapes - 1);
    etapes.push({
      id: `e${i + 1}`,
      nom:    villesPool[Math.floor(Math.random() * villesPool.length)],
      ville:  'Ottawa',
      icone:  iconesPool[Math.floor(Math.random() * iconesPool.length)],
      tempsSecondes: Math.round(duree * ratio),
      distanceKm:    parseFloat((dist * ratio).toFixed(1)),
    });
  }

  etapes.push({
    id: `e${nEtapes}`,
    nom:   'Destination',
    ville: 'Ottawa, ON',
    icone: React.createElement(FaFlagCheckered, { size: 13, color: '#0aad6a' }),
    tempsSecondes: duree,
    distanceKm: dist,
  });

  return {
    id: `TRJ-RAND-${Date.now()}`,
    labelDepart: 'Campus La Cité',
    labelArrivee: 'Destination',
    dureeTotaleSecondes: duree,
    distanceTotaleKm: dist,
    etapes,
  };
}
