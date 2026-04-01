// ============================================================
//  Test/Fixtures/TripViewDataFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class TripViewDataFixtures
    {
        public static readonly IReadOnlyList<TripViewData> All = new List<TripViewData>
        {
            new()
            {
                Id     = "trip-001",
                Driver = new TripDriver("drv-01", "Jean", null, 4.7, 38),
                Vehicle = new TripVehicle("Honda Civic 2020", "Grise", null),
                Departure = new TripPoint(
                    "Campus La Cité, Ottawa",
                    "801 prom. de l'Aviation, Ottawa, ON",
                    "Rendez-vous devant l'entrée principale",
                    45.4215, -75.6972),
                Arrival = new TripPoint(
                    "Place d'Orléans",
                    "110 pl. d'Orléans, Orléans, ON",
                    null,
                    45.4647, -75.5168),
                PricePerPassenger = 7.00,
                PassengerPrice    = 8.05,
                DepartureDate     = "2 avril",
                DepartureTime     = "08h00",
                EstimatedDuration = 35,
                EstimatedDistance = 24.3,
                AvailableSeats    = 2,
                TotalSeats        = 4,
                Preferences       = new TripPreferences(
                    BaggageAllowed: true,
                    PetsAllowed:    false,
                    SmokingAllowed: false,
                    MusicAllowed:   true,
                    FlexibleItinerary: false,
                    DriverNote:     "Soyez ponctuels, je pars à l'heure pile."
                ),
                Status = new TripStatusInfo(
                    TripType:           TripType.Unique,
                    IsRecurrent:        false,
                    MaxDetourMinutes:   null,
                    LastUpdatedAt:      "2026-04-01T18:00:00Z"
                ),
                PaymentMethod = PaymentMethod.Cash,
                LatLngs = Array.Empty<(double, double)>(),
            },
        };
    }
}
