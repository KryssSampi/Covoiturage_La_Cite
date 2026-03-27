/**
 * @file reviews.fixtures.ts
 * @description Données de test pour ReviewsSection.
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/users/{userId}/reviews?limit=5&sort=date_desc
 */

import { Review } from "@/features/dashboard/types/review.types";

export const FIXTURE_REVIEWS: Review[] = [
  {
    id: "1",
    reviewer: "Alice Dupont",
    reviewerId: "djgjsgmni242jnjf",
    revieweeId: "fixture-user",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 4,
    date: "2026-02-19",
    comment: "Très bonne expérience, conducteur ponctuel et sympathique.",
    tags: [],
    tripId: null,
    createdAt: "2026-02-19T10:00:00Z",
  },
  {
    id: "2",
    reviewer: "Bob Martin",
    reviewerId: "djgjsgmni242jsgsbjf",
    revieweeId: "fixture-user",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 5,
    date: "2026-02-18",
    comment: "Trajet agréable, voiture propre et bon conducteur.",
    tags: [],
    tripId: null,
    createdAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "3",
    reviewer: "Charlie Durand",
    reviewerId: "djgjsg352542jf",
    revieweeId: "fixture-user",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 3.5,
    date: "2026-02-17",
    comment: "Le conducteur était en retard, mais le trajet s'est bien passé malgré tout.",
    tags: [],
    tripId: null,
    createdAt: "2026-02-17T10:00:00Z",
  },
  {
    id: "4",
    reviewer: "David Lefevre",
    reviewerId: "djgjsgm64y3633jnjf",
    revieweeId: "fixture-user",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 4,
    date: "2026-01-16",
    comment: "Bonne expérience, conducteur sympathique et ponctuel.",
    tags: [],
    tripId: null,
    createdAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "5",
    reviewer: "Emma Bernard",
    reviewerId: "djgjsgmni23463jf",
    revieweeId: "fixture-user",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 2.5,
    date: "2026-02-15",
    comment: "Mauvaise expérience, le conducteur était en retard et la voiture n'était pas propre.",
    tags: [],
    tripId: null,
    createdAt: "2026-02-15T10:00:00Z",
  },
];
