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
  TypeMessage,
  UseMessagerieReturn,
  buildConversationId,
} from '../types/messagerie.types';
import { genererNouvelleProgression } from '../fixtures/index.fixtures';
import { calculer } from '../utils/trajet-progression.utils';
import { genererRapportPDF } from '../utils/signalement-pdf.utils';


// ═══════════════════════════════════════════════════════
// useProgression — Simule un trajet en temps réel
// ═══════════════════════════════════════════════════════

export function useProgression(
  fixtureInitiale: TrajetProgressionFixture,
  suspended = false,
): UseProgressionReturn {
  const [fixture, setFixture] = useState<TrajetProgressionFixture>(fixtureInitiale);
  const [secondes, setSecondes] = useState<number>(0);
  const [actif] = useState<boolean>(true);
  const pauseRef = useRef<boolean>(false);

  useEffect(() => {
    if (!actif || suspended) return;

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
  }, [actif, fixture, suspended]);

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
  tripId?: string,
): UseMessagerieReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeCorrespondantId, setActiveCorrespondantId] = useState<string>(
    correspondants[0]?.id ?? '',
  );

  // Active le premier correspondant dès que la liste est disponible
  useEffect(() => {
    if (correspondants.length > 0 && !activeCorrespondantId) {
      setActiveCorrespondantId(correspondants[0].id);
    }
  }, [correspondants, activeCorrespondantId]);

  /** Construit des Conversation[] depuis les MessageModel[] bruts de la DB */
  const buildConversationsFromDb = useCallback(
    (rawMessages: Record<string, unknown>[]): Conversation[] => {
      const convMap = new Map<string, Conversation>();
      for (const raw of rawMessages) {
        const senderId = raw.senderId as string;
        const recipId  = (raw.recipientId as string | undefined) ?? '';
        if (!recipId) continue; // ignorer les broadcasts sans destinataire
        const convId = buildConversationId(senderId, recipId);
        const msg: Message = {
          id:             raw.id as string,
          conversationId: convId,
          senderId,
          receiverId:     recipId,
          content:        raw.content as string,
          timestamp:      raw.createdAt as string,
          isRead:         raw.isRead as boolean,
          type:           (raw.type as TypeMessage) ?? 'text',
        };
        if (!convMap.has(convId)) {
          const now = raw.createdAt as string;
          convMap.set(convId, {
            id: convId,
            participantIds: [senderId, recipId].sort() as [string, string],
            messages: [],
            createdAt: now,
            updatedAt: now,
          });
        }
        convMap.get(convId)!.messages.push(msg);
      }
      return Array.from(convMap.values()).map((conv) => ({
        ...conv,
        messages: conv.messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      }));
    },
    [],
  );

  /** Recharge les messages depuis la DB */
  const refresh = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await fetch('/api/db/messages', { cache: 'no-store' });
      if (!res.ok) return;
      const all = (await res.json()) as Record<string, unknown>[];
      const forTrip = all.filter((m) => m.tripId === tripId);
      const convs = buildConversationsFromDb(forTrip);
      setConversations(convs);
    } catch { /* réseau — on garde l'état local */ }
  }, [tripId, buildConversationsFromDb]);

  // Chargement initial
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeConvId = activeCorrespondantId
    ? buildConversationId(moiId, activeCorrespondantId)
    : '';

  const activeConversation: Conversation | null =
    conversations.find((c) => c.id === activeConvId) ?? null;

  const correspondantActif: Correspondant | undefined = correspondants.find(
    (c) => c.id === activeCorrespondantId,
  );

  const messagesActifs: Message[] = activeConversation?.messages ?? [];

  /** Envoie un message dans la conversation active, persiste en DB et crée une notification */
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !activeCorrespondantId) return;
      const convId = buildConversationId(moiId, activeCorrespondantId);
      const now    = new Date().toISOString();
      const msgId  = `MSG-${Date.now()}`;
      const msg: Message = {
        id: msgId,
        conversationId: convId,
        senderId:   moiId,
        receiverId: activeCorrespondantId,
        content:    content.trim(),
        timestamp:  now,
        isRead:     true,
        type:       'text',
      };

      // Mise à jour optimiste
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === convId);
        if (existing) {
          return prev.map((conv) =>
            conv.id === convId
              ? { ...conv, messages: [...conv.messages, msg], updatedAt: now }
              : conv,
          );
        }
        return [...prev, {
          id: convId,
          participantIds: [moiId, activeCorrespondantId].sort() as [string, string],
          messages: [msg],
          createdAt: now,
          updatedAt: now,
        }];
      });

      if (tripId) {
        // Persister le message
        void fetch('/api/db/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: msgId, tripId,
            senderId: moiId, recipientId: activeCorrespondantId,
            content: content.trim(), type: 'text',
            isRead: false, createdAt: now,
          }),
        });

        // Créer une notification pour le destinataire
        const preview = content.trim().length > 60 ? content.trim().slice(0, 60) + '…' : content.trim();
        void fetch('/api/db/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `NTF-MSG-${Date.now()}`,
            userId: activeCorrespondantId,
            type: 'message', title: 'Nouveau message',
            message: preview,
            isRead: false, isImportant: false,
            relatedTripId: tripId, createdAt: now,
          }),
        });
      }
    },
    [moiId, activeCorrespondantId, tripId],
  );

  /** Change la conversation active par ID de correspondant */
  const setActiveCorrespondant = useCallback((correspondantId: string) => {
    setActiveCorrespondantId(correspondantId);
    const convId = buildConversationId(moiId, correspondantId);
    setConversations((prev) => {
      if (prev.some((c) => c.id === convId)) return prev;
      const now = new Date().toISOString();
      return [...prev, {
        id: convId,
        participantIds: [moiId, correspondantId].sort() as [string, string],
        messages: [],
        createdAt: now,
        updatedAt: now,
      }];
    });
  }, [moiId]);

  /** Broadcast : envoie le même message dans toutes les conversations */
  const broadcastMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      const now     = new Date().toISOString();
      const trimmed = content.trim();
      const preview = trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;

      // Préparer tous les messages AVANT le state updater (évite double-appel StrictMode)
      const entries = correspondants.map((c) => {
        const convId = buildConversationId(moiId, c.id);
        const msgId  = `MSG-${Date.now()}-bc-${c.id}`;
        const msg: Message = {
          id: msgId, conversationId: convId,
          senderId: moiId, receiverId: c.id,
          content: trimmed, timestamp: now, isRead: true, type: 'text',
        };
        return { c, convId, msgId, msg };
      });

      // Mise à jour optimiste — aucun effet de bord ici
      setConversations((prev) => {
        const updated = [...prev];
        for (const { c, convId, msg } of entries) {
          const idx = updated.findIndex((cv) => cv.id === convId);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], messages: [...updated[idx].messages, msg], updatedAt: now };
          } else {
            updated.push({ id: convId, participantIds: [moiId, c.id].sort() as [string, string], messages: [msg], createdAt: now, updatedAt: now });
          }
        }
        return updated;
      });

      // Persistance DB — en dehors du state updater
      if (tripId) {
        for (const { c, msgId } of entries) {
          void fetch('/api/db/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: msgId, tripId,
              senderId: moiId, recipientId: c.id,
              content: trimmed, type: 'text',
              isRead: false, createdAt: now,
            }),
          });
          void fetch('/api/db/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: `NTF-MSG-${Date.now()}-${c.id}`,
              userId: c.id, type: 'message', title: 'Nouveau message',
              message: preview,
              isRead: false, isImportant: false,
              relatedTripId: tripId, createdAt: now,
            }),
          });
        }
      }
    },
    [moiId, correspondants, tripId],
  );

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
    refresh,
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
