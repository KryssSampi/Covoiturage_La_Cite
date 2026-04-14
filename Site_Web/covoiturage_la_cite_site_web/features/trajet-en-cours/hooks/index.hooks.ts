'use client';
// ═══════════════════════════════════════════════════════
// Hooks pour la feature "Trajet en cours"
// Simule un trajet en temps réel, gère la messagerie
// et le système de signalement.
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  TrajetProgressionFixture,
  UseProgressionReturn,
} from '../types/progression-signalement.types';
import {
  Correspondant,
  Conversation,
  Message,
  UseMessagerieReturn,
  buildConversationId,
} from '../types/messagerie.types';
import { genererNouvelleProgression } from '../fixtures/index.fixtures';
import { calculer } from '../utils/trajet-progression.utils';
// useSignalement est exporté depuis ./useSignalement
export { useSignalement } from './useSignalement';


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
): UseMessagerieReturn {
  // Initialise les conversations via useMemo pour éviter setState dans useEffect
  const initialConversations = useMemo(() => {
    const now = new Date().toISOString();
    return correspondants.map((c) => ({
      id: buildConversationId(moiId, c.id),
      participantIds: [moiId, c.id].sort() as [string, string],
      messages: [],
      createdAt: now,
      updatedAt: now,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correspondants.length, moiId]);

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

      // NOTE : /api/db/messages et /api/db/notifications désactivés (503).
      // La persistance et les notifications sont gérées en local uniquement.
    },
    [moiId, activeCorrespondantId],
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

      // NOTE : /api/db/messages et /api/db/notifications désactivés (503).
      // Le broadcast reste en mémoire locale uniquement.
    },
    [moiId, correspondants],
  );

  /** Rafraîchit les conversations (stub — API désactivée) */
  const refresh = useCallback(async () => {
    // NOTE : API messages désactivée (503). Les conversations restent en mémoire locale.
    return Promise.resolve();
  }, []);

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


// useSignalement est désormais dans ./useSignalement.ts
