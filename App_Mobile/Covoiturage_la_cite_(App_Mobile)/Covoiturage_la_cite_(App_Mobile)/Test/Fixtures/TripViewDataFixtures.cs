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
            // ── trip-001 : Jean Dupont — Campus → Orléans (matin) ──────────
            new()
            {
                Id     = "trip-001",
                Driver = new TripDriver("drv-01", "Jean Dupont", null, 4.7, 38),
                Vehicle = new TripVehicle("Honda Civic 2020", "Grise", null),
                Departure = new TripPoint(
                    "Campus La Cité",
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

            // ── trip-002 : Sophie Martin — Campus → Carrefour (soir) ───────
            new()
            {
                Id     = "trip-002",
                Driver = new TripDriver("drv-02", "Sophie Martin", null, 4.5, 28),
                Vehicle = new TripVehicle("Toyota Corolla 2021", "Bleue", null),
                Departure = new TripPoint(
                    "Campus La Cité",
                    "801 prom. de l'Aviation, Ottawa, ON",
                    null,
                    45.4215, -75.6972),
                Arrival = new TripPoint(
                    "Carrefour de l'Outaouais",
                    "320 bd Maloney E, Gatineau, QC",
                    null,
                    45.4605, -75.7305),
                PricePerPassenger = 9.00,
                PassengerPrice    = 10.35,
                DepartureDate     = "5 avril",
                DepartureTime     = "17h30",
                EstimatedDuration = 28,
                EstimatedDistance = 18.6,
                AvailableSeats    = 2,
                TotalSeats        = 3,
                Preferences       = new TripPreferences(
                    BaggageAllowed: false,
                    PetsAllowed:    false,
                    SmokingAllowed: false,
                    MusicAllowed:   true,
                    FlexibleItinerary: true,
                    DriverNote:     null
                ),
                Status = new TripStatusInfo(
                    TripType:           TripType.Unique,
                    IsRecurrent:        false,
                    MaxDetourMinutes:   5,
                    LastUpdatedAt:      "2026-04-03T09:00:00Z"
                ),
                PaymentMethod = PaymentMethod.Cash,
                LatLngs = Array.Empty<(double, double)>(),
            },

            // ── trip-003 : Marc Leblanc — Gatineau → Campus (matin) ────────
            new()
            {
                Id     = "trip-003",
                Driver = new TripDriver("drv-03", "Marc Leblanc", null, 4.2, 15),
                Vehicle = new TripVehicle("Hyundai Elantra 2019", "Noire", null),
                Departure = new TripPoint(
                    "Gatineau Centre",
                    "25 rue Laurier, Gatineau, QC",
                    "Derrière le terminus",
                    45.4232, -75.7010),
                Arrival = new TripPoint(
                    "Campus La Cité",
                    "801 prom. de l'Aviation, Ottawa, ON",
                    null,
                    45.4215, -75.6972),
                PricePerPassenger = 6.00,
                PassengerPrice    = 6.90,
                DepartureDate     = "20 mars",
                DepartureTime     = "08h30",
                EstimatedDuration = 30,
                EstimatedDistance = 14.8,
                AvailableSeats    = 3,
                TotalSeats        = 4,
                Preferences       = new TripPreferences(
                    BaggageAllowed: true,
                    PetsAllowed:    true,
                    SmokingAllowed: false,
                    MusicAllowed:   false,
                    FlexibleItinerary: false,
                    DriverNote:     "Pas de musique forte, merci."
                ),
                Status = new TripStatusInfo(
                    TripType:           TripType.Unique,
                    IsRecurrent:        false,
                    MaxDetourMinutes:   null,
                    LastUpdatedAt:      "2026-03-18T12:00:00Z"
                ),
                PaymentMethod = PaymentMethod.Cash,
                LatLngs = Array.Empty<(double, double)>(),
            },
        };
    }
}
