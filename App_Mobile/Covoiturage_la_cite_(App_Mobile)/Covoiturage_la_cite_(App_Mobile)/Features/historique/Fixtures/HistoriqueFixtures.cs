// ============================================================
//  Features/historique/Fixtures/HistoriqueFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.historique.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.historique.Fixtures
{
    public static class HistoriqueFixtures
    {
        public static IReadOnlyList<HistoriqueCardDisplayModel> All() =>
            AsPassenger().Concat(AsDriver()).ToList();

        public static IReadOnlyList<HistoriqueCardDisplayModel> AsPassenger() =>
        [
            new("h1", HistoriqueRole.Passenger,
                DateTimeLabel:       "Mar. 1er avr. · 08h00",
                Route:               new RouteDisplayModel("Campus La Cité", "Place d'Orléans"),
                OtherPersonInitial:  "JD",
                OtherPersonName:     "Jean D.",
                OtherPersonRating:   4.7,
                PriceLabel:          "8,05 $",
                Co2Label:            "1,2 kg CO₂ évité",
                StatusLabel:         "Complété",
                StatusColorHex:      "#0F6E56",
                MyRatingReceived:    5,
                RatingSourceLabel:   "Par Jean D.",
                TripId:              "trip-001"),

            new("h2", HistoriqueRole.Passenger,
                DateTimeLabel:       "Lun. 24 mars · 17h30",
                Route:               new RouteDisplayModel("Place d'Orléans", "Campus La Cité"),
                OtherPersonInitial:  "SL",
                OtherPersonName:     "Sophie L.",
                OtherPersonRating:   4.3,
                PriceLabel:          "7,00 $",
                Co2Label:            "1,1 kg CO₂ évité",
                StatusLabel:         "Complété",
                StatusColorHex:      "#0F6E56",
                MyRatingReceived:    4,
                RatingSourceLabel:   "Par Sophie L.",
                TripId:              "trip-002"),

            new("h3", HistoriqueRole.Passenger,
                DateTimeLabel:       "Mer. 19 mars · 08h00",
                Route:               new RouteDisplayModel("Maison", "Campus La Cité"),
                OtherPersonInitial:  "MT",
                OtherPersonName:     "Marie T.",
                OtherPersonRating:   4.9,
                PriceLabel:          "6,00 $",
                Co2Label:            "0,9 kg CO₂ évité",
                StatusLabel:         "Annulé",
                StatusColorHex:      "#DC2626",
                MyRatingReceived:    null,
                RatingSourceLabel:   null,
                TripId:              "trip-003"),
        ];

        public static IReadOnlyList<HistoriqueCardDisplayModel> AsDriver() =>
        [
            new("h4", HistoriqueRole.Driver,
                DateTimeLabel:       "Ven. 28 mars · 07h45",
                Route:               new RouteDisplayModel("Campus La Cité", "Orléans"),
                OtherPersonInitial:  "AC",
                OtherPersonName:     "Alex C. + 1",
                OtherPersonRating:   4.2,
                PriceLabel:          "14,00 $",
                Co2Label:            "2,4 kg CO₂ évité",
                StatusLabel:         "Complété",
                StatusColorHex:      "#0F6E56",
                MyRatingReceived:    5,
                RatingSourceLabel:   "Par vos passagers",
                TripId:              "trip-001"),

            new("h5", HistoriqueRole.Driver,
                DateTimeLabel:       "Jeu. 20 mars · 08h00",
                Route:               new RouteDisplayModel("Maison", "Campus La Cité"),
                OtherPersonInitial:  "PB",
                OtherPersonName:     "Pierre B.",
                OtherPersonRating:   3.8,
                PriceLabel:          "7,00 $",
                Co2Label:            "1,1 kg CO₂ évité",
                StatusLabel:         "Complété",
                StatusColorHex:      "#0F6E56",
                MyRatingReceived:    null,
                RatingSourceLabel:   null,
                TripId:              "trip-002"),
        ];
    }
}
