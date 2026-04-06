// En-tête de la messagerie — titre, sélecteur de correspondant, panneau broadcast
import { useState } from 'react';
import { FaPhone } from 'react-icons/fa';
import type { Correspondant } from '../../types/messagerie.types';

interface ConversationHeaderProps {
  roleMoi: 'driver' | 'passenger';
  correspondants: Correspondant[];
  correspondantActif?: Correspondant;
  activeCorrespondantId: string;
  unreadCounts: Record<string, number>;
  onSetActiveCorrespondant: (id: string) => void;
  onBroadcast: (message: string) => void;
  isFR: boolean;
}

// En-tête sombre de la section messagerie avec sélection de correspondant et diffusion
export function ConversationHeader({
  roleMoi, correspondants, correspondantActif, activeCorrespondantId,
  unreadCounts, onSetActiveCorrespondant, onBroadcast, isFR,
}: ConversationHeaderProps) {
  const [showCorrespondants, setShowCorrespondants] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastVal, setBroadcastVal] = useState('');

  const handleBroadcast = () => {
    if (!broadcastVal.trim()) return;
    onBroadcast(broadcastVal.trim());
    setBroadcastVal('');
    setShowBroadcast(false);
  };

  return (
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
              onClick={() => {
                onSetActiveCorrespondant(c.id);
                setShowCorrespondants(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                background: c.id === activeCorrespondantId ? '#f0f4fb' : '#fff',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(8,49,110,0.06)',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: c.couleurAvatar,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#fff',
              }}>
                {c.initiales}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#0d1f3c' }}>
                  {c.prenom} {c.nom}
                </div>
                <div style={{ fontSize: 10, color: '#7a90b8' }}>
                  {c.estEnLigne ? '🟢 En ligne' : '⚫ Hors ligne'}
                </div>
              </div>
              {unreadCounts[c.id] ? (
                <span style={{
                  background: '#08316e', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 10,
                }}>
                  {unreadCounts[c.id]}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Panneau de diffusion (conducteur) */}
      {showBroadcast && roleMoi === 'driver' && (
        <div style={{
          marginTop: 10,
          background: '#fff',
          borderRadius: 10,
          padding: 10,
          boxShadow: '0 4px 16px rgba(8,49,110,.2)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0d1f3c', marginBottom: 6 }}>
            {isFR ? 'Diffuser à tous les passagers' : 'Broadcast to all passengers'}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={broadcastVal}
              onChange={(e) => setBroadcastVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBroadcast(); }}
              placeholder={isFR ? 'Message à tous…' : 'Message to all…'}
              style={{
                flex: 1,
                background: '#f0f4fb',
                border: '1.5px solid rgba(8,49,110,0.18)',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11,
                fontFamily: 'DM Sans, sans-serif',
                color: '#0d1f3c',
                outline: 'none',
              }}
            />
            <button
              onClick={handleBroadcast}
              style={{
                background: 'linear-gradient(135deg,#c8960a,#e6b325)',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {isFR ? 'Envoyer' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Nom du correspondant actif + bouton appel */}
      {correspondantActif && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: correspondantActif.couleurAvatar,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff',
          }}>
            {correspondantActif.initiales}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>
              {correspondantActif.prenom} {correspondantActif.nom}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
              {correspondantActif.estEnLigne ? 'En ligne' : 'Hors ligne'}
            </div>
          </div>
          {correspondantActif.telephone && (
            <a
              href={`tel:${correspondantActif.telephone}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 6,
                padding: '4px 8px',
                color: '#fff',
                fontSize: 10,
                textDecoration: 'none',
              }}
            >
              <FaPhone size={9} />
              {isFR ? 'Appeler' : 'Call'}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
