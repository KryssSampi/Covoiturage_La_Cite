// Palette de couleurs et styles partagés pour la page trajet-en-cours
export const C = {
  p: '#08316e', pm: '#0d4490', pl: '#1a5cb0', pd: '#051f4a',
  bg: '#f0f4fb', w: '#fff',
  green: '#0aad6a', gnb: 'rgba(10,173,106,0.1)',
  red: '#e03050', rnb: 'rgba(224,48,80,0.09)',
  gold: '#c8960a', gnl: 'rgba(200,150,10,0.09)',
  cyan: '#0098c8',
  muted: '#7a90b8', text: '#0d1f3c',
  b: 'rgba(8,49,110,0.09)', b2: 'rgba(8,49,110,0.18)',
  sh: '0 2px 18px rgba(8,49,110,0.09)',
} as const;

// Style réutilisable pour les cartes
export const card = {
  background: C.w, border: `1px solid ${C.b}`,
  borderRadius: 16, boxShadow: C.sh,
  overflow: 'hidden' as const,
};
