import { useMemo } from "react";
import { buildDashboardNotificationsView } from "@/core/services/dashboard-selector.service";
import {
  Notification,
  NotificationType,
} from "../types/notification.types";

interface UseNotificationsReturn {
  unreadCount: number;
  unreadBadgeLabel: string;
  displayedNotifications: Notification[];
  isImportant: (type: NotificationType) => boolean;
}

export function useNotifications(notifications: Notification[]): UseNotificationsReturn {
  return useMemo(() => buildDashboardNotificationsView(notifications), [notifications]);
}
