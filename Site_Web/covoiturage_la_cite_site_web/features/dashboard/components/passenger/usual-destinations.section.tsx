// features/dashboard/components/passenger/usual-destinations.section.tsx
"use client";

import { FaExternalLinkAlt } from "react-icons/fa";
import { Language, useAppState } from "@/core/state/app_state";
import { useUsualDestinations } from "../../hooks/useUsualDestinations";
import { DestinationCard } from "./destination.card";

/**
 * Affiche une section contenant les destinations habituelles/fréquentes de l'utilisateur.
 * 
 * Ce composant récupère la liste des destinations habituelles et les affiche dans un conteneur scroll.
 * Si aucune destination n'est disponible, il affiche un message d'état vide.
 * Le composant est sensible à la langue et affiche le contenu en français ou en anglais selon l'état de l'application.
 * 
 * @component
 * @returns {JSX.Element} Une section contenant la liste des destinations habituelles avec en-tête, lignes de séparation et cartes de destination.
 * 
 * @example
 * ```tsx
 * <UsualDestinationsSection />
 * ```
 * 
 * @remarks
 * - Utilise le hook `useAppState()` pour accéder à la préférence de langue actuelle
 * - Utilise le hook `useUsualDestinations()` pour récupérer les destinations et déterminer si la liste est vide
 * - Affiche les composants `DestinationCard` pour chaque destination dans la liste
 * - Implémente un design réactif avec les classes Tailwind CSS
 */
export function UsualDestinationsSection() {
  // Récupère l'état de l'application pour accéder à la langue
  const appState                  = useAppState();
  // Hook personnalisé pour récupérer les destinations habituelles et vérifier si la liste est vide
  const { destinations, surveyMap, isEmpty } = useUsualDestinations();

  return (
    <section className="w-full py-5 flex flex-col items-center border rounded-lg shadow-md mx-5 bg-white">
      {/* En-tête avec titre et icône */}
      <div className="flex justify-between items-baseline mx-auto px-5 w-full">
        <h2 className="text-3xl text-black font-bold">
          {/* Affiche le titre selon la langue sélectionnée */}
          {appState.lang === Language.FR ? "Destinations Habituelles" : "My Usual Destinations"}
        </h2>
        <FaExternalLinkAlt className="text-2xl text-gray-400" />
      </div>

      {/* Ligne de séparation */}
      <div className="w-13/15 h-1 flex bg-[#08316e] rounded-full" />

      {/* Affiche un message vide ou la liste des destinations */}
      {isEmpty ? (
        <div className="w-full h-50 flex justify-center items-center">
          <p className="text-gray-700 text-center text-4xl m-10">
            {appState.lang === Language.FR
              ? "Aucune destination habituelle pour le moment."
              : "No usual destinations at the moment."}
          </p>
        </div>
      ) : (
        /* Liste scrollable des destinations habituelles */
        <div className="w-full h-80 overflow-y-auto flex flex-col gap-4 px-5 py-3">
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              survey={surveyMap.get(`${dest.departure}|${dest.destination}`)}
            />
          ))}
        </div>
      )}

      {/* Ligne de séparation inférieure */}
      <div className="w-13/15 h-1 flex bg-[#08316e] rounded-full mt-4" />
    </section>
  );
}
