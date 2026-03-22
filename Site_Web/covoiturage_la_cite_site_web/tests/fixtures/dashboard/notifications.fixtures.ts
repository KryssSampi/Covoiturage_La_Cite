/**
 * @file notifications.fixtures.ts
 * @description Données de test pour NotificationsSection.
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/users/{userId}/notifications?limit=6&unreadFirst=true
 */

import { Notification, NotificationType } from "@/features/dashboard/types/notification.types";

export const FIXTURE_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: NotificationType.Confirmation,
    message: "Your ride has been confirmed.",
    date: "2026-02-14",
    time: "10:00",
    isRead: false,
  },
  {
    id: 2,
    type: NotificationType.UrgentRappel,
    message: "Your ride is about to start.",
    date: "2026-02-16",
    time: "09:00",
    isRead: false,
  },
  {
    id: 3,
    type: NotificationType.Annulation,
    message: "Your ride has been canceled.",
    date: "2026-02-18",
    time: "08:00",
    isRead: false,
  },
  {
    id: 4,
    type: NotificationType.Retard,
    message: "Your ride is delayed.",
    date: "2026-02-20",
    time: "07:30",
    isRead: false,
  },
  {
    id: 5,
    type: NotificationType.Infos,
    message: "Your ride information has been updated.",
    date: "2026-02-13",
    time: "07:00",
    isRead: false,
  },
  {
    id: 6,
    type: NotificationType.Rappel,
    message: "Don't forget your upcoming ride.",
    date: "2026-02-17",
    time: "06:30",
    isRead: true,
  },
  {
    id: 7,
    type: NotificationType.AlerteTrajet,
    message: "Un nouveau trajet correspond à votre alerte : Barrhaven → Campus La Cité, le 22 mars à 07:45.",
    date: "2026-03-20",
    time: "14:30",
    isRead: false,
    link: "/passenger/search/me?dep=Barrhaven&arr=Campus%20La%20Cit%C3%A9&depLng=-75.77&depLat=45.275&arrLng=-75.683&arrLat=45.4215",
  },
];
