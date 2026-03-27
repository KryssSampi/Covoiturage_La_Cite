// En-tête de la messagerie — titre, sélecteur de correspondant, panneau broadcast
import { useState } from 'react';
import { FaPhone } from 'react-icons/fa';
import type { Correspondant } from '../types/messagerie.types';

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
              onClick={() => { onSetActiveCorrespondant(c.id); setShowCorrespondants(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(8,49,110,.06)',
                background: c.id === activeCorrespondantId
                  ? 'rgba(8,49,110,0.05)' : '#fff',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: c.couleurAvatar,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>
                {c.initiales}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0d1f3c' }}>{c.prenom} {c.nom}</div>
                <div style={{ fontSize: 10, color: '#7a90b8' }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: c.estEnLigne ? '#0aad6a' : '#7a90b8', marginRight: 4, verticalAlign: 'middle' }} />
                  {c.estEnLigne ? (isFR ? 'En ligne' : 'Online') : (isFR ? 'Hors ligne' : 'Offline')}
                </div>
              </div>
              {c.id === activeCorrespondantId && (
                <span style={{ color: '#0aad6a', fontSize: 12 }}>✓</span>
              )}
              {/* Badge non-lus */}
              {(unreadCounts[c.id] ?? 0) > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: '#e03050', color: '#fff',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {unreadCounts[c.id]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Panneau de diffusion (broadcast) */}
      {showBroadcast && roleMoi === 'driver' && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
            📡 {isFR ? 'Message vers tous les passagers' : 'Message to all passengers'}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <input
              value={broadcastVal}
              onChange={(e) => setBroadcastVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBroadcast(); }}
              placeholder={isFR ? "Message groupé…" : "Group message…"}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none',
                fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                outline: 'none',
              }}
            />
            <button
              onClick={handleBroadcast}
              style={{
                padding: '7px 14px', background: '#c8960a',
                border: 'none', borderRadius: 8, color: '#fff',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {isFR ? 'Envoyer' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Info du correspondant actif + bouton appel */}
      {!showCorrespondants && !showBroadcast && correspondantActif && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: correspondantActif.couleurAvatar,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {correspondantActif.initiales}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {correspondantActif.prenom} {correspondantActif.nom}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: correspondantActif.estEnLigne ? '#0aad6a' : '#7a90b8', display: 'inline-block' }} />
              {correspondantActif.estEnLigne ? (isFR ? 'En ligne' : 'Online') : (isFR ? 'Hors ligne' : 'Offline')} · {correspondantActif.role === 'driver' ? (isFR ? 'Conductrice' : 'Driver') : (isFR ? 'Passager' : 'Passenger')}
            </div>
          </div>
          {/* Bouton appel téléphonique */}
          {correspondantActif.telephone && (
            <a
              href={`tel:${correspondantActif.telephone}`}
              title={`Appeler ${correspondantActif.prenom}`}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#0aad6a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, textDecoration: 'none',
              }}
            >
              <FaPhone size={13} color="#fff" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
