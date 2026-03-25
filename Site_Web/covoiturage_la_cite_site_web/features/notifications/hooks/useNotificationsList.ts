"use client";

/**
 * Hook de configuration ListDetailPage pour les notifications.
 * Commun aux deux rôles. Fournit uniquement les filtres, options de tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { NotificationType } from "@/features/dashboard/types";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function useNotificationsConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Filtres par type de notification et statut lu/non-lu
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: isFR ? "Type" : "Type",
      field: "type",
      options: [
        { value: NotificationType.Confirmation, label: "Confirmation"                         },
        { value: NotificationType.UrgentRappel, label: isFR ? "Rappel urgent" : "Urgent reminder" },
        { value: NotificationType.Annulation,   label: isFR ? "Annulation"    : "Cancellation"    },
        { value: NotificationType.Retard,       label: isFR ? "Retard"        : "Delay"            },
        { value: NotificationType.Infos,        label: isFR ? "Information"   : "Information"      },
        { value: NotificationType.Rappel,       label: isFR ? "Rappel"        : "Reminder"         },
        { value: NotificationType.NouvelleAvis, label: isFR ? "Nouvel avis"   : "New review"       },
      ],
    },
  ], [isFR]);

  // Tri par date
  const sortOptions: SortOption[] = useMemo(() => [
    {
      value: "date-desc",
      label: isFR ? "Plus récent" : "Newest",
      compareFn: <T,>(a: T, b: T) =>
        new Date(String((b as Record<string, unknown>).date)).getTime() -
        new Date(String((a as Record<string, unknown>).date)).getTime(),
    },
    {
      value: "date-asc",
      label: isFR ? "Plus ancien" : "Oldest",
      compareFn: <T,>(a: T, b: T) =>
        new Date(String((a as Record<string, unknown>).date)).getTime() -
        new Date(String((b as Record<string, unknown>).date)).getTime(),
    },
  ], [isFR]);

  // Recherche sur le message
  const searchKeys = ["message", "type"];

  const emptyMessage = isFR
    ? "Aucune notification pour le moment."
    : "No notifications at the moment.";

  return { filterGroups, sortOptions, searchKeys, emptyMessage };
}
