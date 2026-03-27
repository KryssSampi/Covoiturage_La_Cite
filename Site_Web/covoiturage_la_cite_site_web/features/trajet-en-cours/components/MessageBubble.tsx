// Bulle de message individuelle avec séparateur de date optionnel
import type { Message, Correspondant, MoiInfo } from '../types/messagerie.types';

interface MessageBubbleProps {
  msg: Message;
  isMoi: boolean;
  moi: MoiInfo;
  correspondantActif?: Correspondant;
  showDateDivider: boolean;
  isFR: boolean;
}

// Formate une date en heure locale (HH:MM)
function HourStr(d: Date): string {
  return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
}

// Affiche une bulle de message avec avatar, horodatage et indicateur de lecture
export function MessageBubble({
  msg, isMoi, moi, correspondantActif, showDateDivider, isFR,
}: MessageBubbleProps) {
  const msgDate = new Date(msg.timestamp);
  return (
    <div>
      {/* Séparateur de date si nécessaire */}
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
      {/* Bulle avec avatar — row-reverse si c'est moi */}
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
