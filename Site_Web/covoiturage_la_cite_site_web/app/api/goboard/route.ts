import { NextResponse } from 'next/server';
import { GoTaskService } from '@/server/services/GamificationService';
import { withAuth } from '@/server/auth';
import type { EcoChallengeAvecProgression } from '@/features/goboard/types/goboard.types';

// ─── ViewConverter : EcoChallengeAvecProgressionDto (Server Core) → EcoChallengeAvecProgression (frontend) ───

const METRIC_LABELS: Record<string, string> = {
  distance_km:       'km parcourus',
  trips_count:       'trajets complétés',
  co2_kg:            'kg de CO₂ économisés',
  unique_passengers: 'passagers uniques',
};

function mapDefi(dto: Record<string, unknown>): EcoChallengeAvecProgression {
  const metricType  = String(dto.metricType ?? '');
  const metricLabel = METRIC_LABELS[metricType] ?? metricType;
  const targetValue = Number(dto.targetValue ?? 0);
  const rewardPts   = Number(dto.rewardPoints ?? 0);
  const statut      = (dto.statut ?? 'verrouille') as 'actif' | 'verrouille' | 'complete';

  return {
    id:          String(dto.id ?? ''),
    titre:       String(dto.title ?? dto.titre ?? 'Défi'),
    description: `Objectif : ${targetValue} ${metricLabel}`,
    cibleCO2Kg:  targetValue,
    recompense:  `+${rewardPts} points GoScore`,
    progres:     Number(dto.progres ?? 0),
    statut,
  };
}

/**
 * GET /api/goboard — GoBoard complet de l'utilisateur courant (Server Core).
 * Agrège : GoScore, palier, rang, GoTasks avec progression, classement, défis éco.
 *
 * ViewConverter : defisEco (EcoChallengeAvecProgressionDto → EcoChallengeAvecProgression)
 * Note : Le paramètre ?userId= de l'ancienne route self-service est ignoré —
 * le Server Core détermine l'utilisateur via le JWT.
 */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await GoTaskService.getGoBoard(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const raw = (result.data ?? {}) as Record<string, unknown>;

    // Convertir defisEco : champs Server Core → champs frontend attendus par CardDefis
    const rawDefis = Array.isArray(raw.defisEco)
      ? (raw.defisEco as Record<string, unknown>[])
      : [];
    const defisEco: EcoChallengeAvecProgression[] = rawDefis.map(mapDefi);

    // Server Core GoBoardResponseDto n'expose pas encore GoEvents ni pointsPerdus
    const payload = {
      goEvents:     [],
      pointsPerdus: 0,
      ...raw,
      defisEco,          // remplacement par la version convertie
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[api/goboard]', err);
    return NextResponse.json(
      { error: 'Impossible de charger les données GoBoard' },
      { status: 500 },
    );
  }
}
