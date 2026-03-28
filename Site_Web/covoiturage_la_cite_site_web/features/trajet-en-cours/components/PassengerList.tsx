// Liste des passagers à bord — visible uniquement pour le conducteur
import { FaStar } from 'react-icons/fa';
import type { PassagerInfo } from '../types/trajet-en-cours.types';
import { C, card } from './trajet-page-styles';

interface PassengerListProps {
  passagers: PassagerInfo[];
  isFR: boolean;
}

export function PassengerList({ passagers, isFR }: PassengerListProps) {
  return (
    <div style={card}>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, display: 'inline-block' }} />
          Passagers à bord ({passagers.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
          {passagers.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: C.bg, borderRadius: 9, border: `1px solid ${C.b}` }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: p.couleurAvatar,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0,
              }}>
                {p.initiales}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.prenom} {p.nom}</div>
                <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isFR ? 'Siège' : 'Seat'} {p.place} · <FaStar size={10} color={C.gold} /> {p.note}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: C.gnb, color: C.green }}>
                {isFR ? 'À bord' : 'On board'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
