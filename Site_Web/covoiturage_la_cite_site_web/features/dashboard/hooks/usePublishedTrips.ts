/**
 * @file usePublishedTrips.ts
 * @description Hook gérant la logique des trajets publiés du conducteur.
 * Extrait de publised_trips_section.tsx.
 *
 * Responsabilités :
 * - Tri prioritaire des trajets (InProgress → à venir → publiés → annulés → terminés)
 * - Gestion de l'état d'expansion de la liste de passagers par carte
 * - Formatage du statut (libellé + couleur du badge)
 *
 * @param trips Liste brute des trajets publiés
 */

import { useMemo, useState } from "react";
import {
  PublishedTrip,
  PublishedTripStatus,
  PublishedTripCardModel,
} from "../types";
import { Language } from "@/core/state/app_state";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UsePublishedTripsReturn {
  /** Trajets triés et encapsulés en modèles de carte, prêts pour le rendu */
  tripModels: PublishedTripCardModel[];
  /** Tableau d'état d'expansion de la liste passagers, indexé sur tripModels */
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  /** Met à jour l'état d'expansion de la liste passagers */
  setIsPassengerListOpens: React.Dispatch<
    React.SetStateAction<{ isPassengerListOpen: boolean }[]>
  >;
  /** Retourne le libellé localisé du statut */
  formatStatus: (status: PublishedTripStatus, lang: Language) => string;
  /** Retourne les classes Tailwind de couleur du badge statut */
  getStatusColor: (status: PublishedTripStatus) => string;
}

// ─── Helpers purs (hors hook pour éviter les re-créations) ───────────────────

/**
 * Ordre de priorité d'affichage des trajets dans la liste :
 * 1. En cours (InProgress) — toujours en premier, GPS actif
 * 2. À venir (non-annulés, non-terminés) — triés par date croissante
 * 3. Publiés en attente (Published) — tri date croissante
 * 4. Annulés — tri date décroissante
 * 5. Terminés — tri date décroissante
 */
function organizeTrips(trips: PublishedTrip[]): PublishedTrip[] {
  const inProgress   = trips.filter(t => t.status === PublishedTripStatus.InProgress);
  const upcoming     = trips
    .filter(t => [PublishedTripStatus.Confirmed, PublishedTripStatus.Full].includes(t.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pending      = trips
    .filter(t => t.status === PublishedTripStatus.Published)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const cancelled    = trips
    .filter(t => t.status === PublishedTripStatus.Cancelled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const completed    = trips
    .filter(t => [PublishedTripStatus.Completed, PublishedTripStatus.NoShow].includes(t.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return [...inProgress, ...upcoming, ...pending, ...cancelled, ...completed];
}

/** Map statut → libellés FR/EN */
const STATUS_LABELS: Record<PublishedTripStatus, Record<Language, string>> = {
  [PublishedTripStatus.Published]:  { [Language.FR]: "Publiée",   [Language.EN]: "Published"   },
  [PublishedTripStatus.Full]:       { [Language.FR]: "Complet",   [Language.EN]: "Full"         },
  [PublishedTripStatus.Confirmed]:  { [Language.FR]: "Confirmée", [Language.EN]: "Confirmed"    },
  [PublishedTripStatus.InProgress]: { [Language.FR]: "En cours",  [Language.EN]: "In Progress"  },
  [PublishedTripStatus.Completed]:  { [Language.FR]: "Terminée",  [Language.EN]: "Completed"    },
  [PublishedTripStatus.Cancelled]:  { [Language.FR]: "Annulée",   [Language.EN]: "Cancelled"    },
  [PublishedTripStatus.NoShow]:     { [Language.FR]: "Absent",    [Language.EN]: "No Show"      },
};

/** Map statut → classes Tailwind pour le badge */
const STATUS_COLORS: Record<PublishedTripStatus, string> = {
  [PublishedTripStatus.Published]:  "bg-gray-400 text-white",
  [PublishedTripStatus.Full]:       "bg-yellow-400 text-white",
  [PublishedTripStatus.Confirmed]:  "bg-green-400 text-white",
  [PublishedTripStatus.InProgress]: "bg-red-400 text-white",
  [PublishedTripStatus.Completed]:  "bg-[#08316e] text-white",
  [PublishedTripStatus.Cancelled]:  "bg-orange-400 text-white",
  [PublishedTripStatus.NoShow]:     "bg-gray-400 text-white",
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePublishedTrips(trips: PublishedTrip[]): UsePublishedTripsReturn {
  // Tri mémoïsé — recalculé uniquement si la liste de trajets change
  const tripModels = useMemo<PublishedTripCardModel[]>(
    () =>
      organizeTrips(trips).map((trip) => ({
        trip,
        isPassengerListOpen: false,
      })),
    [trips],
  );

  // État d'expansion des listes passagers, indexé sur tripModels
  const [isPassengerListOpens, setIsPassengerListOpens] = useState(
    tripModels.map(() => ({ isPassengerListOpen: false })),
  );

  const formatStatus = (status: PublishedTripStatus, lang: Language): string =>
    STATUS_LABELS[status]?.[lang] ?? status;

  const getStatusColor = (status: PublishedTripStatus): string =>
    STATUS_COLORS[status] ?? "bg-gray-400 text-white";

  return {
    tripModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    formatStatus,
    getStatusColor,
  };
}
