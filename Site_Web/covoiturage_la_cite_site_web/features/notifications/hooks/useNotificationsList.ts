"use client";

/**
 * Hook gérant la configuration ListDetailPage pour les notifications.
 * Commun aux deux rôles. Fournit filtres par type et statut de lecture.
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { useDb } from "@/core/context/db.context";
import { notificationModelToNotification } from "@/features/dashboard/converters/dashboard.converter";
import { NotificationType } from "@/features/dashboard/types";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function useNotificationsList() {
  const { lang } = useAppState();
  const { myNotifications } = useDb();
  const isFR = lang === Language.FR;

  // Transformation des NotificationModel → Notification (type UI dashboard)
  const items = useMemo(
    () => myNotifications.map(notificationModelToNotification),
    [myNotifications],
  );

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

  return { items, filterGroups, sortOptions, searchKeys, emptyMessage };
}
