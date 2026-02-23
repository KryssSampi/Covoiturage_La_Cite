// features/dashboard/components/passenger/recents-destinations.section.tsx
"use client";


import { FaExternalLinkAlt } from "react-icons/fa";
import { Language, useAppState } from "@/core/state/app_state";
import { useRecentDestinations } from "../../hooks/useRecentDestinations";
import { DestinationCard } from "./destination.card";

/**
 * RecentsDestinationsSection
 *
 *  une section du tableau de bord passager affichant les destinations récentes du passager,
 *  triées par date décroissante (les plus récentes en premier).
 *
 * Affiche un titre, une ligne de séparation, puis une liste de cartes de destination (DestinationCard).
 * Si aucune destination récente n'est disponible, affiche un message d'information.
 * @remarks
 * - Les données sont simulées via useRecentDestinations() et FIXTURE_RECENT_DESTINATIONS.
 * - TODO: Brancher sur GET /api/passenger/{userId}/recent-destinations?limit=5
 *  → Basé sur l'historique des réservations du passager (itinéraires distincts les plus récents).
 * 
 * @uses DestinationCard — composant de carte d'itinéraire (départ → arrivée, date, heure)
 * @uses useRecentDestinations — hook de logique métier pour les destinations récentes
 * @uses FIXTURE_RECENT_DESTINATIONS — données de test (à remplacer par API)
 * @author  Kryss Rayane
 * @version 1.0
 * @since 2024-06-01
 * @license MIT
 */

export function RecentsDestinationsSection() {
  const appState                  = useAppState();
  const { destinations, isEmpty } = useRecentDestinations();

  return (
    <section className="w-full py-5 flex flex-col items-center border rounded-lg shadow-md mx-5 bg-white">
      <div className="flex justify-between items-baseline mx-auto px-5 w-full">
        <h2 className="text-3xl text-black font-bold">
          {appState.lang === Language.FR ? "Destinations Récentes" : "Recent Destinations"}
        </h2>
        <FaExternalLinkAlt className="text-2xl text-gray-400" />
      </div>

      <div className="w-13/15 h-1 flex bg-[#08316e] rounded-full" />

      {isEmpty ? (
        <div className="w-full h-50 flex justify-center items-center">
          <p className="text-gray-700 text-center text-4xl m-10">
            {appState.lang === Language.FR
              ? "Aucune destination récente pour le moment."
              : "No recent destinations at the moment."}
          </p>
        </div>
      ) : (
        <div className="w-full h-80 overflow-y-auto flex flex-col gap-4 px-5 py-3">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>
      )}

      <div className="w-13/15 h-1 flex bg-[#08316e] rounded-full mt-4" />
    </section>
  );
}
