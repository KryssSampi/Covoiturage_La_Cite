import { Language } from '@/core/state/app_state';
import { NotificationType } from '@/features/dashboard/types';
import type { FilterGroup, SortOption } from '@/shared/components/list-detail-page';

function compareDateDesc<T>(a: T, b: T): number {
  return (
    new Date(String((b as Record<string, unknown>).date)).getTime() -
    new Date(String((a as Record<string, unknown>).date)).getTime()
  );
}

function compareDateAsc<T>(a: T, b: T): number {
  return (
    new Date(String((a as Record<string, unknown>).date)).getTime() -
    new Date(String((b as Record<string, unknown>).date)).getTime()
  );
}

function compareRatingDesc<T>(a: T, b: T): number {
  return ((b as Record<string, number>).rating ?? 0) - ((a as Record<string, number>).rating ?? 0);
}

function compareRatingAsc<T>(a: T, b: T): number {
  return ((a as Record<string, number>).rating ?? 0) - ((b as Record<string, number>).rating ?? 0);
}

export function buildNotificationsListDetailConfig(lang: Language) {
  const isFR = lang === Language.FR;

  const filterGroups: FilterGroup[] = [
    {
      title: 'Type',
      field: 'type',
      options: [
        { value: NotificationType.Confirmation, label: 'Confirmation' },
        { value: NotificationType.UrgentRappel, label: isFR ? 'Rappel urgent' : 'Urgent reminder' },
        { value: NotificationType.Annulation, label: isFR ? 'Annulation' : 'Cancellation' },
        { value: NotificationType.Retard, label: isFR ? 'Retard' : 'Delay' },
        { value: NotificationType.Infos, label: isFR ? 'Information' : 'Information' },
        { value: NotificationType.Rappel, label: isFR ? 'Rappel' : 'Reminder' },
        { value: NotificationType.NouvelleAvis, label: isFR ? 'Nouvel avis' : 'New review' },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { value: 'date-desc', label: isFR ? 'Plus recent' : 'Newest', compareFn: compareDateDesc },
    { value: 'date-asc', label: isFR ? 'Plus ancien' : 'Oldest', compareFn: compareDateAsc },
  ];

  return {
    filterGroups,
    sortOptions,
    searchKeys: ['message', 'type'],
    emptyMessage: isFR ? 'Aucune notification pour le moment.' : 'No notifications at the moment.',
  };
}

export function buildReviewsListDetailConfig(lang: Language) {
  const isFR = lang === Language.FR;

  const sortOptions: SortOption[] = [
    { value: 'date-desc', label: isFR ? 'Plus recent' : 'Newest', compareFn: compareDateDesc },
    { value: 'date-asc', label: isFR ? 'Plus ancien' : 'Oldest', compareFn: compareDateAsc },
    { value: 'rating-desc', label: isFR ? 'Meilleure note' : 'Highest rating', compareFn: compareRatingDesc },
    { value: 'rating-asc', label: isFR ? 'Note la plus basse' : 'Lowest rating', compareFn: compareRatingAsc },
  ];

  return {
    sortOptions,
    searchKeys: ['reviewer', 'comment'],
    emptyMessage: isFR ? 'Aucun avis pour le moment.' : 'No reviews yet.',
  };
}

export function buildNouveautesListDetailConfig(lang: Language) {
  const isFR = lang === Language.FR;

  return {
    searchKeys: ['title'],
    emptyMessage: isFR ? 'Aucune nouveaute pour le moment.' : 'No new features yet.',
  };
}
