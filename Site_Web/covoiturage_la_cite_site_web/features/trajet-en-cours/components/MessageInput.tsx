// Zone de saisie de message avec textarea et bouton d'envoi
import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  isFR: boolean;
}

// Barre d'entrée de message — textarea redimensionnable + bouton envoi
export function MessageInput({ onSend, isFR }: MessageInputProps) {
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    onSend(inputVal.trim());
    setInputVal('');
  };

  return (
    <div style={{
      padding: '9px 12px',
      borderTop: '1px solid rgba(8,49,110,0.09)',
      display: 'flex', alignItems: 'flex-end', gap: 8,
      background: '#fff', flexShrink: 0,
    }}>
      <textarea
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder={isFR ? "Écrire un message…" : "Write a message…"}
        rows={1}
        style={{
          flex: 1,
          background: '#f0f4fb',
          border: '1.5px solid rgba(8,49,110,0.18)',
          borderRadius: 10, padding: '8px 12px',
          fontSize: 12, fontFamily: 'DM Sans, sans-serif',
          color: '#0d1f3c', outline: 'none', resize: 'none', height: 38,
        }}
      />
      <button
        onClick={handleSend}
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg,#08316e,#1a5cb0)',
          border: 'none', color: '#fff', fontSize: 15,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ➤
      </button>
    </div>
  );
}
