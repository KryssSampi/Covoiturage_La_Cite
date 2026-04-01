// ============================================================
//  Features/brouillons/Fixtures/BrouillonsFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;
using Covoiturage_la_cite__App_Mobile_.Features.brouillons.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.brouillons.Fixtures
{
    public static class BrouillonsFixtures
    {
        // ── Cartes pour l'affichage dans la liste ─────────────────────
        public static IReadOnlyList<BrouillonCardDisplayModel> Cards() =>
        [
            new("draft-1",
                Route:             new RouteDisplayModel("Campus La Cité", "Place d'Orléans"),
                ScheduleLabel:     "Mar. 18 mars · 08h30",
                ModifiedLabel:     "Modifié il y a 2 jours",
                CompletionPercent: 85,
                CompletionLabel:   "1 champ manquant",
                IsComplete:        false),

            new("draft-2",
                Route:             new RouteDisplayModel("Maison", "Campus La Cité"),
                ScheduleLabel:     "Date non définie",
                ModifiedLabel:     "Modifié il y a 5 jours",
                CompletionPercent: 45,
                CompletionLabel:   "4 champs manquants",
                IsComplete:        false),

            new("draft-3",
                Route:             new RouteDisplayModel("Campus La Cité", "Centre commercial"),
                ScheduleLabel:     "Sam. 19 avr. · 14h00",
                ModifiedLabel:     "Modifié il y a 1 semaine",
                CompletionPercent: 100,
                CompletionLabel:   "Prêt à publier",
                IsComplete:        true),
        ];

        // ── FormState pré-rempli par draftId (pour CreateTripPage) ────
        public static CreateTripFormState? FormStateById(string draftId) => draftId switch
        {
            "draft-1" => new CreateTripFormState
            {
                DepartureLocation  = "Campus La Cité, Ottawa",
                ArrivalLocation    = "Place d'Orléans, Ottawa",
                DepartureDate      = "2026-03-18",
                DepartureTime      = "08:30",
                MaxPassengers      = 4,
                AvailableSeats     = 3,
                PricePerPassenger  = 5.0,
                PaymentMethod      = PaymentMethod.Interac,
                Preferences        = new TripFormPreferences
                {
                    BaggageAllowed = true,
                    MusicAllowed   = true,
                },
                Notes = "Départ côté entrée principale",
            },
            "draft-2" => new CreateTripFormState
            {
                ArrivalLocation   = "Campus La Cité, Ottawa",
                PricePerPassenger = 5.0,
            },
            "draft-3" => new CreateTripFormState
            {
                DepartureLocation  = "Campus La Cité, Ottawa",
                ArrivalLocation    = "Place Laurier, Québec",
                DepartureDate      = "2026-04-19",
                DepartureTime      = "14:00",
                MaxPassengers      = 4,
                AvailableSeats     = 3,
                PricePerPassenger  = 8.0,
                PaymentMethod      = PaymentMethod.Cash,
                Preferences        = TripFormPreferences.Default,
            },
            _ => null,
        };
    }
}
