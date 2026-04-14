"use client";

import React, { useRef, useState } from 'react';
import type { useOnboarding } from '../../hooks/useOnboarding';
import { Language, useAppState } from '@/core/state/app_state';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

function getPoliticsText(isFR: boolean): string {
  return isFR ? `Politique d'utilisation — Covoiturage La Cité

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

En cochant la case ci-dessous, vous confirmez avoir lu, compris et accepté l'ensemble de la présente politique d'utilisation.` : `Terms of Use — Covoiturage La Cité

By using the College La Cité carpooling application, you accept the following conditions:

1. Respect for Others
All interactions between members must be respectful. Harassing, discriminatory or aggressive behavior will result in immediate account suspension.

2. Road Safety
The driver agrees to comply with the Highway Safety Code of Quebec and Ontario at all times. Phone use while driving, driving under the influence of substances or excessive speeding are strictly prohibited.

3. Punctuality and Reliability
Members agree to respect agreed schedules. Repeated and last-minute cancellations may result in penalties on the Go score.

4. Compliant Vehicle
The driver certifies that their vehicle is in good mechanical condition, has valid insurance and that all provided documents are authentic.

5. Confidentiality
Personal information shared (phone number, location) must not be used for purposes other than coordinating carpooling.

6. Data Usage
The application collects data necessary for matching and service improvement, in accordance with Law 25 (Quebec) and PIPEDA (federal).

7. Sanctions
College La Cité reserves the right to suspend or ban any account that does not comply with these conditions, without notice and without refund.

By checking the box below, you confirm that you have read, understood and accepted this entire terms of use policy.`;
}

export default function PoliticsStep({ onboarding }: Props) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { isLoading, error, submitPolitics } = onboarding;

  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const POLITIQUE_TEXT = getPoliticsText(isFR);

  // callback ref to initialize measurement without triggering sync setState in an effect
  const setScrollRef = (el: HTMLDivElement | null) => {
    scrollRef.current = el;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) {
      // schedule async to avoid sync-setState warnings
      setTimeout(() => setScrolledToBottom(true), 0);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setScrolledToBottom(atBottom);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? "Politique d'utilisation" : 'Terms of Use'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFR
            ? 'Lisez et acceptez nos conditions avant de continuer.'
            : 'Read and accept our terms before continuing.'}
        </p>
      </div>

      {/* Scrollable text block */}
      <div
        ref={setScrollRef}
        onScroll={handleScroll}
        className="h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
      >
        {POLITIQUE_TEXT}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submitPolitics}
        disabled={isLoading || !scrolledToBottom}
        aria-disabled={isLoading || !scrolledToBottom}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? (isFR ? 'Traitement...' : 'Processing...')
          : (isFR ? "J'accepte la politique d'utilisation" : 'I accept the terms of use')}
      </button>

      {!scrolledToBottom && (
        <p className="mt-2 text-xs text-gray-500">
          {isFR
            ? 'Faites défiler jusqu\'en bas pour activer le bouton.'
            : 'Scroll to the bottom to enable the button.'}
        </p>
      )}
    </div>
  );
}
