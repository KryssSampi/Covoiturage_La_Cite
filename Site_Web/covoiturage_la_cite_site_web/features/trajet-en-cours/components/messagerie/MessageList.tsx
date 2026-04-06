// Liste des messages avec défilement automatique et état vide
import { useRef, useEffect, useMemo } from 'react';
import type { Message, Correspondant, MoiInfo } from '../../types/messagerie.types';

interface MessageListProps {
  messages: Message[];
  moi: MoiInfo;
  correspondantActif?: Correspondant;
  isFR: boolean;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function HourStr(d: Date): string {
  return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
}

// ─── MessageBubble (interne pour éviter la duplication) ────────────────────────

interface MessageBubbleProps {
  msg: Message;
  isMoi: boolean;
  moi: MoiInfo;
  correspondantActif?: Correspondant;
  showDateDivider: boolean;
  isFR: boolean;
}

function MessageBubble({
  msg, isMoi, moi, correspondantActif, showDateDivider, isFR,
}: MessageBubbleProps) {
  const msgDate = new Date(msg.timestamp);
  return (
    <div>
      {showDateDivider && (
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
            {msg.content}
          </div>
          <div style={{
            fontSize: 9, color: '#7a90b8', marginTop: 3,
            textAlign: isMoi ? 'left' : 'right',
          }}>
            {HourStr(msgDate)}
            {isMoi && <span style={{ marginLeft: 4 }}>✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MessageList ───────────────────────────────────────────────────────────────

export function MessageList({
  messages,
  moi,
  correspondantActif,
  isFR,
}: MessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas à l'ajout de messages
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // IDs de messages qui doivent afficher un séparateur de date
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
    <div ref={messagesContainerRef} style={{
      flex: 1, overflowY: 'auto', padding: '12px 14px',
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
  );
}
