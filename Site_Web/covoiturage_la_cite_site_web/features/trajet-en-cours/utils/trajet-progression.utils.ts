import type {
  TrajetProgressionFixture,
  ProgressionCalculee,
  StatutEtape,
} from '../types/progression-signalement.types';

/**
 * Calcule l'état de progression d'un trajet à un instant donné.
 * Fonction pure : aucun effet de bord, même entrée → même sortie.
 *
 * @param fixture   Données du trajet (durée, distance, étapes)
 * @param sec       Secondes écoulées depuis le départ
 */
export function calculer(
  fixture: TrajetProgressionFixture,
  sec: number,
): ProgressionCalculee {
  const { dureeTotaleSecondes, distanceTotaleKm, etapes } = fixture;
  const clampedSec = Math.min(sec, dureeTotaleSecondes);
  const pct = (clampedSec / dureeTotaleSecondes) * 100;

  const distParcourue = parseFloat(((distanceTotaleKm * pct) / 100).toFixed(1));
  const distRestante  = parseFloat((distanceTotaleKm - distParcourue).toFixed(1));
  const secRestantes  = Math.max(dureeTotaleSecondes - clampedSec, 0);

  const eta = new Date();
  eta.setSeconds(eta.getSeconds() + secRestantes);
  const etaTexte = eta.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

  // Statuts des étapes : fait / actif / en_attente
  const statutsEtapes: StatutEtape[] = etapes.map(() => 'en_attente');
  let etapeActuelleIndex = 0;

  for (let i = 0; i < etapes.length; i++) {
    if (clampedSec >= etapes[i].tempsSecondes) {
      statutsEtapes[i] = 'fait';
      etapeActuelleIndex = i;
    }
  }

  // La prochaine étape non atteinte = active (sauf si trajet terminé)
  const prochaine = etapes.findIndex((e) => clampedSec < e.tempsSecondes);
  if (prochaine !== -1 && clampedSec < dureeTotaleSecondes) {
    statutsEtapes[prochaine] = 'actif';
    etapeActuelleIndex = prochaine;
  }

  return {
    pourcentage:           parseFloat(pct.toFixed(1)),
    distanceParcourueKm:   distParcourue,
    distanceRestanteKm:    distRestante,
    dureeRestanteSecondes: secRestantes,
    etaTexte,
    statutsEtapes,
    etapeActuelleIndex,
    estTermine: clampedSec >= dureeTotaleSecondes,
  };
}
