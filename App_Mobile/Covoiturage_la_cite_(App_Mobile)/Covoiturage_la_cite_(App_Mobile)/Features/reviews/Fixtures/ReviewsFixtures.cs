// ============================================================
//  Features/reviews/Fixtures/ReviewsFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.reviews.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.reviews.Fixtures
{
    public static class ReviewsFixtures
    {
        public static IReadOnlyList<ReviewsCardDisplayModel> All() =>
            Received().Concat(Given()).ToList();

        public static IReadOnlyList<ReviewsCardDisplayModel> Received() =>
        [
            new("r1", ReviewDirection.Received,
                PersonInitial: "AD", PersonName: "Alice Dupont",
                DateLabel:  "19 fév. 2026",
                TripRoute:  "Ottawa → Orléans",
                Comment:    "Très bonne expérience, conducteur ponctuel et sympathique.",
                Stars:      4, StarsLabel: "★★★★☆"),

            new("r2", ReviewDirection.Received,
                PersonInitial: "MB", PersonName: "Marc Bernard",
                DateLabel:  "10 fév. 2026",
                TripRoute:  "Orléans → Campus La Cité",
                Comment:    "Trajet agréable, musique sympa. Je recommande !",
                Stars:      5, StarsLabel: "★★★★★"),

            new("r3", ReviewDirection.Received,
                PersonInitial: "LT", PersonName: "Laura Tremblay",
                DateLabel:  "2 fév. 2026",
                TripRoute:  "Campus La Cité → Orléans",
                Comment:    "Conducteur à l'heure, voiture propre.",
                Stars:      5, StarsLabel: "★★★★★"),
        ];

        public static IReadOnlyList<ReviewsCardDisplayModel> Given() =>
        [
            new("r4", ReviewDirection.Given,
                PersonInitial: "JD", PersonName: "Jean Dubois",
                DateLabel:  "1er avr. 2026",
                TripRoute:  "Campus La Cité → Place d'Orléans",
                Comment:    "Conducteur ponctuel, trajet très confortable.",
                Stars:      5, StarsLabel: "★★★★★"),

            new("r5", ReviewDirection.Given,
                PersonInitial: "SL", PersonName: "Sophie Leblanc",
                DateLabel:  "24 mars 2026",
                TripRoute:  "Orléans → Campus La Cité",
                Comment:    "Bon trajet dans l'ensemble, légèrement en retard.",
                Stars:      4, StarsLabel: "★★★★☆"),
        ];
    }
}
