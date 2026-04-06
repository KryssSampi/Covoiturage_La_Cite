// ═══════════════════════════════════════════════════════════════════════
// TrajetMapSection — Section carte + barre de progression
// ═══════════════════════════════════════════════════════════════════════
import { TrajetMap } from './TrajetMap';
import { ProgressionSection } from './ProgressionMessagerie';
import type { TrajetMapFixture } from '../types/map.types';
import type { ProgressionSectionProps } from '../types/progression-signalement.types';
import type { UseTrajetMapReturn } from '../hooks/useTrajetMap';

interface TrajetMapSectionProps {
  role: 'driver' | 'passenger';
  mapFixture: TrajetMapFixture;
  activeProgressionFixture: ProgressionSectionProps['fixture'];
  trajetMap: UseTrajetMapReturn;
  driverPos: { lat: number; lng: number } | null;
  myPos: { lat: number; lng: number } | null;
  departureCoords?: { lat: number; lng: number };
  arrivalCoords?: { lat: number; lng: number };
  tripId?: string;
}

export function TrajetMapSection({
  role,
  mapFixture,
  activeProgressionFixture,
  trajetMap,
  driverPos,
  myPos,
  departureCoords,
  arrivalCoords,
  tripId,
}: TrajetMapSectionProps) {
  return (
    <div style={{ position: 'relative', marginBottom: 40, zIndex: 1 }}>
      <TrajetMap
        height="400px"
        role={role}
        trajetHook={trajetMap}
        fixture={mapFixture}
        driverPos={driverPos}
        myPos={myPos}
        departureCoords={departureCoords}
        arrivalCoords={arrivalCoords}
      />
      <div style={{ position: 'relative', marginTop: -20, zIndex: 10, padding: '0 16px' }}>
        <ProgressionSection
          fixture={activeProgressionFixture}
          mapState={{
            pourcentageComplete: trajetMap.state.pourcentageComplete,
            distanceParcourue: trajetMap.state.distanceParcourue,
            distanceTotaleM: trajetMap.state.fixture.distanceTotaleM,
            estTermine: trajetMap.state.estTermine,
            labelDepart: trajetMap.state.fixture.labelDepart,
            labelArrivee: trajetMap.state.fixture.labelArrivee,
            vitesseMoyenneKmh: trajetMap.state.fixture.vitesseMoyenneKmh,
          }}
        />
      </div>
    </div>
  );
}
