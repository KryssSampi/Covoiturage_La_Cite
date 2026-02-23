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
    id: 1,
    reviewer: "Alice Dupont",
    reviewerid: "djgjsgmni242jnjf",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 4,
    date: "2026-02-19",
    comment: "Très bonne expérience, conducteur ponctuel et sympathique.",
  },
  {
    id: 2,
    reviewer: "Bob Martin",
    reviewerid: "djgjsgmni242jsgsbjf",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 5,
    date: "2026-02-18",
    comment: "Trajet agréable, voiture propre et bon conducteur.",
  },
  {
    id: 3,
    reviewer: "Charlie Durand",
    reviewerid: "djgjsg352542jf",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 3.5,
    date: "2026-02-17",
    comment:
      "Le conducteur était en retard, mais le trajet s'est bien passé malgré tout.",
  },
  {
    id: 4,
    reviewer: "David Lefevre",
    reviewerid: "djgjsgm64y3633jnjf",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 4,
    date: "2026-01-16",
    comment: "Bonne expérience, conducteur sympathique et ponctuel.",
  },
  {
    id: 5,
    reviewer: "Emma Bernard",
    reviewerid: "djgjsgmni23463jf",
    reviewerpicture: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 2.5,
    date: "2026-02-15",
    comment:
      "Mauvaise expérience, le conducteur était en retard et la voiture n'était pas propre.",
  },
];
