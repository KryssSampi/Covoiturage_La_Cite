'use client';

import type { useOnboarding } from '../../hooks/useOnboarding';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

const POLITIQUE_TEXT = `Politique d'utilisation — Covoiturage La Cité

En utilisant l'application de covoiturage du Collège La Cité, vous acceptez les conditions suivantes :

1. Respect des personnes
Toutes les interactions entre membres doivent être respectueuses. Les comportements harcelants, discriminatoires ou agressifs entraîneront la suspension immédiate du compte.

2. Sécurité routière
Le conducteur s'engage à respecter le Code de la sécurité routière du Québec et de l'Ontario à tout moment. L'usage du téléphone au volant, la conduite sous l'influence de substances ou la vitesse excessive sont strictement interdits.

3. Ponctualité et fiabilité
Les membres s'engagent à respecter les horaires convenus. Les annulations répétées et de dernière minute peuvent entraîner des pénalités sur le score Go.

4. Véhicule conforme
Le conducteur certifie que son véhicule est en bon état mécanique, possède une assurance valide et que tous les documents fournis sont authentiques.

5. Confidentialité
Les informations personnelles partagées (numéro de téléphone, localisation) ne doivent pas être utilisées à des fins autres que la coordination du covoiturage.

6. Usage des données
L'application collecte les données nécessaires à la mise en relation et à l'amélioration du service, conformément à la Loi 25 (Québec) et à la LPRPDE (fédérale).

7. Sanctions
Le Collège La Cité se réserve le droit de suspendre ou bannir tout compte ne respectant pas ces conditions, sans préavis et sans remboursement.

En cochant la case ci-dessous, vous confirmez avoir lu, compris et accepté l'ensemble de la présente politique d'utilisation.`;

export default function PoliticsStep({ onboarding }: Props) {
  const { isLoading, error, submitPolitics } = onboarding;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Politique d&apos;utilisation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Lisez et acceptez nos conditions avant de continuer.
        </p>
      </div>

      {/* Scrollable text block */}
      <div className="h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {POLITIQUE_TEXT}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submitPolitics}
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Traitement...' : "J'accepte la politique d'utilisation"}
      </button>
    </div>
  );
}
