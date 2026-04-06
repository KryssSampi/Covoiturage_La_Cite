// ═══════════════════════════════════════════════════════════════════════
// TrajetInfoPanel — Panneau d'information du trajet avec messagerie
// ═══════════════════════════════════════════════════════════════════════
import { TripInfoPanel } from './TripInfoPanel';
import { PassengerList } from './PassengerList';
import { Messagerie } from './ProgressionMessagerie';
import type { TrajetEnCoursData } from '../types/trajet-en-cours.types';
import type { Correspondant, MoiInfo, UseMessagerieReturn } from '../types/messagerie.types';

interface TrajetInfoPanelProps {
  trajetData: TrajetEnCoursData;
  role: 'driver' | 'passenger';
  isFR: boolean;
  moiInfo: MoiInfo;
  correspondants: Correspondant[];
  messagerie: UseMessagerieReturn;
  onRefreshMessages: () => void;
}

export function TrajetInfoPanel({
  trajetData,
  role,
  isFR,
  moiInfo,
  correspondants,
  messagerie,
  onRefreshMessages,
}: TrajetInfoPanelProps) {
  const { depart, arrivee, preferences, statut, conducteur, tarif, passagers } = trajetData;

  return (
    <>
      {/* Grille 3 colonnes : infos + messagerie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 16, alignItems: 'stretch' }}>
        <TripInfoPanel
          depart={depart} arrivee={arrivee} preferences={preferences}
          statut={statut} conducteur={conducteur} tarif={tarif} isFR={isFR}
        >
          {role === 'driver' && passagers.length > 0 && (
            <PassengerList passagers={passagers} isFR={isFR} />
          )}
        </TripInfoPanel>

        {/* Messagerie */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Messagerie
            roleMoi={role}
            correspondants={correspondants}
            moi={moiInfo}
            conversations={messagerie.conversations}
            activeConversation={messagerie.activeConversation}
            messagesActifs={messagerie.messagesActifs}
            unreadCounts={messagerie.unreadCounts}
            onSendMessage={messagerie.sendMessage}
            onSetActiveCorrespondant={messagerie.setActiveCorrespondant}
            onBroadcast={messagerie.broadcastMessage}
            onRefresh={onRefreshMessages}
          />
        </div>
      </div>
    </>
  );
}
