import type { Destination } from '@/features/dashboard/types';
import {
  IMPORTANT_NOTIFICATION_TYPES,
  NOTIFICATION_COUNT_MAX_DISPLAY,
  type Notification,
  type NotificationType,
} from '@/features/dashboard/types/notification.types';
import type { SurveyDestination } from '@/features/dashboard/types/survey-destination.types';

export function buildDashboardNotificationsView(notifications: Notification[]) {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const unreadBadgeLabel =
    unreadCount > NOTIFICATION_COUNT_MAX_DISPLAY ? '99+' : unreadCount.toString();

  const sorted = [...notifications].sort((left, right) => {
    const leftTime = new Date(`${left.date}T${left.time}`).getTime();
    const rightTime = new Date(`${right.date}T${right.time}`).getTime();
    return rightTime - leftTime;
  });

  const displayLimit = Math.max(Math.floor(notifications.length / 3), 6);
  const displayedNotifications = sorted.slice(0, displayLimit);

  const isImportant = (type: NotificationType): boolean =>
    IMPORTANT_NOTIFICATION_TYPES.includes(type);

  return {
    unreadCount,
    unreadBadgeLabel,
    displayedNotifications,
    isImportant,
  };
}

export function buildDashboardDestinationView(
  destinations: Destination[],
  surveyDestinations: SurveyDestination[],
) {
  const sortedDestinations = [...destinations].sort(
    (left, right) => right.disponibility - left.disponibility,
  );

  const surveyMap = new Map<string, SurveyDestination>();
  for (const surveyDestination of surveyDestinations) {
    surveyMap.set(
      `${surveyDestination.departure}|${surveyDestination.destination}`,
      surveyDestination,
    );
  }

  return {
    destinations: sortedDestinations,
    surveyMap,
    isEmpty: sortedDestinations.length === 0,
  };
}
