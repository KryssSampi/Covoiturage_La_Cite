import {
  tripModelToPublishedTrip,
  reservationModelToRequest,
  notificationModelToNotification,
  reviewModelToReview,
} from '@/features/dashboard/converters/dashboard.converter';

export type DriverDashboardResult = {
  publishedTrips:       ReturnType<typeof tripModelToPublishedTrip>[];
  reservationRequests:  ReturnType<typeof reservationModelToRequest>[];
  notifications:        ReturnType<typeof notificationModelToNotification>[];
  reviews:              ReturnType<typeof reviewModelToReview>[];
  stats: {
    tripsCount:    number;
    co2SavedKg:    number;
    averageRating: number;
    goScore:       number;
  };
  finance: {
    soldeDisponible:     number;
    currency:            string;
    weeklyProfit:        number;
    weeklyPendingProfit: number;
    penalties:           number;
  };
};

// Dead code — use /api/dashboard/driver/[id] BFF route instead
export function buildDriverDashboard(_driverId: string): DriverDashboardResult | null {
  return null;
}
