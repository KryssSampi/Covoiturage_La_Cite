// ═══════════════════════════════════════════════════════════════════════
// TrajetActionBar — Barre d'actions : évaluation + signalement
// ═══════════════════════════════════════════════════════════════════════
import type { Dispatch, SetStateAction } from 'react';
import { ActionBar } from './ActionBar';
import type { EvaluationState, ConducteurInfo, PointTrajet, PassagerInfo } from '../types/trajet-en-cours.types';

interface TrajetActionBarProps {
  role: 'driver' | 'passenger';
  conducteur: Pick<ConducteurInfo, 'prenom' | 'nom'>;
  depart: Pick<PointTrajet, 'nom'>;
  arrivee: Pick<PointTrajet, 'nom'>;
  passagers: PassagerInfo[];
  alreadyReviewedIds: string[];
  eval_: EvaluationState;
  setEval_: Dispatch<SetStateAction<EvaluationState>>;
  onSubmitEval: () => void;
  ratingLabels: Record<number, string>;
  isFR: boolean;
  onShowSignalement: () => void;
  onShowLitige: () => void;
}

export function TrajetActionBar({
  role, conducteur, depart, arrivee, passagers, alreadyReviewedIds,
  eval_, setEval_, onSubmitEval, ratingLabels, isFR,
  onShowSignalement, onShowLitige,
}: TrajetActionBarProps) {
  return (
    <ActionBar
      role={role}
      conducteur={conducteur} depart={depart} arrivee={arrivee}
      passagers={passagers} alreadyReviewedIds={alreadyReviewedIds}
      eval_={eval_} setEval_={setEval_} onSubmitEval={onSubmitEval}
      ratingLabels={ratingLabels} isFR={isFR}
      onShowSignalement={onShowSignalement}
      onShowLitige={onShowLitige}
    />
  );
}
