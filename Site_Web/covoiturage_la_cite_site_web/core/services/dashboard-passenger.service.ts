
import {
  tripModelToReservation,
  notificationModelToNotification,
  reviewModelToReview,
} from '@/features/dashboard/converters/dashboard.converter';

export type PassengerDashboardResult = {
  reservations:  ReturnType<typeof tripModelToReservation>[];
  notifications: ReturnType<typeof notificationModelToNotification>[];
  reviews:       ReturnType<typeof reviewModelToReview>[];
  stats: {
    tripsCount:    number;
    co2SavedKg:    number;
    averageRating: number;
    goScore:       number;
  };
};


