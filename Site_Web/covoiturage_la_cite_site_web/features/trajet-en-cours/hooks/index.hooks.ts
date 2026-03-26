'use client';
// ═══════════════════════════════════════════════════════
// Hooks pour la feature "Trajet en cours"
// Simule un trajet en temps réel, gère la messagerie
// et le système de signalement.
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrajetProgressionFixture,
  UseProgressionReturn,
  SignalementData,
  SignalementOptions,
  CibleSignalement,
  NiveauSecurite,
  EtapeSignalement,
  UseSignalementReturn,
} from '../types/progression-signalement.types';
import {
  Correspondant,
  Conversation,
  Message,
  UseMessagerieReturn,
  buildConversationId,
} from '../types/messagerie.types';
import { genererNouvelleProgression, conversationsInitialesFixture } from '../fixtures/index.fixtures';
import { calculer } from '../utils/trajet-progression.utils';
import { genererRapportPDF } from '../utils/signalement-pdf.utils';


// ═══════════════════════════════════════════════════════
// useProgression — Simule un trajet en temps réel
// ═══════════════════════════════════════════════════════

export function useProgression(
  fixtureInitiale: TrajetProgressionFixture,
): UseProgressionReturn {
  const [fixture, setFixture] = useState<TrajetProgressionFixture>(fixtureInitiale);
  const [secondes, setSecondes] = useState<number>(0);
  const [actif] = useState<boolean>(true);
  const pauseRef = useRef<boolean>(false);

  useEffect(() => {
    if (!actif) return;

    const id = setInterval(() => {
      setSecondes((prev) => {
        const next = prev + 1;
        if (next > fixture.dureeTotaleSecondes && !pauseRef.current) {
          pauseRef.current = true;
          // Pause 3 s puis nouvelle fixture
          setTimeout(() => {
            const newFixture = genererNouvelleProgression();
            setFixture(newFixture);
            setSecondes(0);
            pauseRef.current = false;
          }, 3000);
          return fixture.dureeTotaleSecondes;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [actif, fixture]);

  const progression = calculer(fixture, secondes);

  return { fixture, secondesEcoulees: secondes, progression, estActif: actif };
}


// ═══════════════════════════════════════════════════════
// useMessagerie — Gère les conversations en temps réel
// Modèle : Conversation { id, participantIds, messages }
// ID de conversation déterministe via buildConversationId
// ═══════════════════════════════════════════════════════

export function useMessagerie(
  moiId: string,
  correspondants: Correspondant[],
  initialConversations: Conversation[] = conversationsInitialesFixture,
): UseMessagerieReturn {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeCorrespondantId, setActiveCorrespondantId] = useState<string>(
    correspondants[0]?.id ?? '',
  );

  const activeConvId = activeCorrespondantId
    ? buildConversationId(moiId, activeCorrespondantId)
    : '';

  const activeConversation: Conversation | null =
    conversations.find((c) => c.id === activeConvId) ?? null;

  const correspondantActif: Correspondant | undefined = correspondants.find(
    (c) => c.id === activeCorrespondantId,
  );

  const messagesActifs: Message[] = activeConversation?.messages ?? [];

  /** Envoie un message dans la conversation active */
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !activeCorrespondantId) return;
      const convId = buildConversationId(moiId, activeCorrespondantId);
      const now = new Date().toISOString();
      const msg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: moiId,
        receiverId: activeCorrespondantId,
        content: content.trim(),
        timestamp: now,
        isRead: true,
        type: 'text',
      };
      setConversations((prev) => prev.map((conv) =>
        conv.id === convId
          ? { ...conv, messages: [...conv.messages, msg], updatedAt: now }
          : conv,
      ));
    },
    [moiId, activeCorrespondantId],
  );

  /** Change la conversation active par ID de correspondant */
  const setActiveCorrespondant = useCallback((correspondantId: string) => {
    setActiveCorrespondantId(correspondantId);
    // Crée la conversation si elle n'existe pas encore
    const convId = buildConversationId(moiId, correspondantId);
    setConversations((prev) => {
      if (prev.some((c) => c.id === convId)) return prev;
      const now = new Date().toISOString();
      const newConv: Conversation = {
        id: convId,
        participantIds: [moiId, correspondantId].sort() as [string, string],
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, newConv];
    });
  }, [moiId]);

  /** Broadcast : envoie le même message dans toutes les conversations (conducteur → tous passagers) */
  const broadcastMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      const now = new Date().toISOString();
      setConversations((prev) => {
        const updated = [...prev];
        correspondants.forEach((c) => {
          const convId = buildConversationId(moiId, c.id);
          const msg: Message = {
            id: `msg-${Date.now()}-bc-${c.id}`,
            conversationId: convId,
            senderId: moiId,
            receiverId: c.id,
            content: content.trim(),
            timestamp: now,
            isRead: true,
            type: 'text',
          };
          const idx = updated.findIndex((cv) => cv.id === convId);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], messages: [...updated[idx].messages, msg], updatedAt: now };
          } else {
            updated.push({ id: convId, participantIds: [moiId, c.id].sort() as [string, string], messages: [msg], createdAt: now, updatedAt: now });
          }
        });
        return updated;
      });
    },
    [moiId, correspondants],
  );

  // Nombre de messages non lus par correspondant
  const unreadCounts: Record<string, number> = correspondants.reduce(
    (acc, c) => {
      const convId = buildConversationId(moiId, c.id);
      const conv = conversations.find((cv) => cv.id === convId);
      acc[c.id] = (conv?.messages ?? []).filter(
        (m: Message) => !m.isRead && m.senderId === c.id,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    conversations,
    activeConversation,
    correspondantActif,
    messagesActifs,
    sendMessage,
    setActiveCorrespondant,
    broadcastMessage,
    unreadCounts,
  };
}


// ═══════════════════════════════════════════════════════
// useSignalement — Système de signalement en 5 étapes
// ═══════════════════════════════════════════════════════

const INIT: SignalementData = {
  cible: null,
  cibleNom: '',
  motifId: null,
  motifLabel: '',
  niveauSecurite: null,
  description: '',
  heureIncident: '',
  preuves: [],
  options: {
    anonyme: false,
    accepterContact: true,
    bloquerUtilisateur: false,
    notifierResultat: true,
  },
};

function genRef() {
  return `SIG-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

export function useSignalement(
  trajetId: string,
  cibleNomParDefaut = '',
  cibleRoleParDefaut?: CibleSignalement,
): UseSignalementReturn {
  const [etape, setEtape] = useState<EtapeSignalement>(1);
  const [data, setData] = useState<SignalementData>({
    ...INIT,
    cibleNom: cibleNomParDefaut,
    cible: cibleRoleParDefaut ?? null,
  });
  const [soumis, setSoumis] = useState(false);
  const [refNum, setRefNum] = useState('');

  const peutContinuer: boolean = (() => {
    switch (etape) {
      case 1: return !!data.cible;
      case 2: return !!data.motifId;
      case 3: return !!data.niveauSecurite;
      case 4: return data.description.trim().length >= 50;
      case 5: return true;
      default: return false;
    }
  })();

  const setCible = useCallback((c: CibleSignalement) =>
    setData((p) => ({ ...p, cible: c, motifId: null, motifLabel: '' })), []);

  const setMotif = useCallback((id: string, label: string) =>
    setData((p) => ({ ...p, motifId: id, motifLabel: label })), []);

  const setNiveauSecurite = useCallback((n: NiveauSecurite) =>
    setData((p) => ({ ...p, niveauSecurite: n })), []);

  const setDescription = useCallback((d: string) =>
    setData((p) => ({ ...p, description: d })), []);

  const setHeureIncident = useCallback((h: string) =>
    setData((p) => ({ ...p, heureIncident: h })), []);

  const ajouterPreuve = useCallback((pv: string) =>
    setData((p) => ({
      ...p,
      preuves: p.preuves.length < 5 ? [...p.preuves, pv] : p.preuves,
    })), []);

  const supprimerPreuve = useCallback((i: number) =>
    setData((p) => ({ ...p, preuves: p.preuves.filter((_, idx) => idx !== i) })), []);

  const setOption = useCallback((key: keyof SignalementOptions, val: boolean) =>
    setData((p) => ({ ...p, options: { ...p.options, [key]: val } })), []);

  const suivant = useCallback(() => {
    if (peutContinuer && etape < 5) setEtape((p) => (p + 1) as EtapeSignalement);
  }, [peutContinuer, etape]);

  const precedent = useCallback(() => {
    if (etape > 1) setEtape((p) => (p - 1) as EtapeSignalement);
  }, [etape]);

  const soumettre = useCallback(() => {
    const ref = genRef();
    setRefNum(ref);
    setSoumis(true);
    console.log('[Signalement]', { trajetId, ref, ...data });
  }, [data, trajetId]);

  const reinitialiser = useCallback(() => {
    setEtape(1);
    setData({ ...INIT, cibleNom: cibleNomParDefaut, cible: cibleRoleParDefaut ?? null });
    setSoumis(false);
    setRefNum('');
  }, [cibleNomParDefaut, cibleRoleParDefaut]);

  /** Génère et ouvre un rapport PDF du signalement */
  const telechargerPDF = useCallback(() => {
    genererRapportPDF(data, trajetId, refNum);
  }, [data, trajetId, refNum]);

  return {
    etapeActuelle: etape,
    signalement: data,
    estSoumis: soumis,
    referenceSignalement: refNum,
    peutContinuer,
    setCible, setMotif, setNiveauSecurite,
    setDescription, setHeureIncident,
    ajouterPreuve, supprimerPreuve, setOption,
    suivant, precedent, soumettre,
    reinitialiser, telechargerPDF,
  };
}
