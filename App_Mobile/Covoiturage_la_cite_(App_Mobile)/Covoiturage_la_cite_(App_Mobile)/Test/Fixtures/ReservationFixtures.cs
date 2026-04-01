// ============================================================
//  Test/Fixtures/ReservationFixtures.cs
//  Données de test — réservations du passager (vue passager)
//  et demandes reçues (vue conducteur).
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    /// <summary>
    /// Réservations du passager (ReservationModel) et
    /// demandes reçues par le conducteur (ReservationRequestModel).
    /// </summary>
    public static class ReservationFixtures
    {
        // ── Vue passager : mes réservations ──────────────────────────────
        public static readonly IReadOnlyList<ReservationModel> PassengerReservations =
            new List<ReservationModel>
        {
            new()
            {
                Id          = "res-001",
                Driver      = new ReservationRequestDriverProfile("drv-01", "Jean Dupont", null, 4.8, 42),
                Departure   = "Campus La Cité",
                Destination = "Place d'Orléans",
                Date        = "2026-04-02",
                Time        = "08:00",
                MaxPassengers = 4,
                Passengers  = new List<PassengerAvatar>
                {
                    new("user-pass-01", "Moi", null),
                    new("user-pass-02", "Alex Tremblay", null),
                },
                Status      = ReservationStatus.Confirmed,
                TripId      = "trip-001",
            },
            new()
            {
                Id          = "res-002",
                Driver      = new ReservationRequestDriverProfile("drv-02", "Sophie Martin", null, 4.5, 28),
                Departure   = "Campus La Cité",
                Destination = "Carrefour de l'Outaouais",
                Date        = "2026-04-05",
                Time        = "17:30",
                MaxPassengers = 3,
                Passengers  = new List<PassengerAvatar>
                {
                    new("user-pass-01", "Moi", null),
                },
                Status      = ReservationStatus.Pending,
                TripId      = "trip-002",
            },
            new()
            {
                Id          = "res-003",
                Driver      = new ReservationRequestDriverProfile("drv-03", "Marc Leblanc", null, 4.2, 15),
                Departure   = "Gatineau Centre",
                Destination = "Campus La Cité",
                Date        = "2026-03-20",
                Time        = "08:30",
                MaxPassengers = 4,
                Passengers  = new List<PassengerAvatar>
                {
                    new("user-pass-01", "Moi", null),
                },
                Status      = ReservationStatus.Completed,
                TripId      = "trip-003",
            },
        };

        // ── Vue conducteur : demandes reçues ─────────────────────────────
        // (mêmes que ReservationRequestFixtures, centralisé ici)
        public static IReadOnlyList<ReservationRequestModel> ReceivedRequests =>
            ReservationRequestFixtures.All;

        public static IReadOnlyList<ReservationModel> ForPassenger(string passengerId)
            => PassengerReservations;  // TODO: filter by userId once API wired

        public static IReadOnlyList<ReservationRequestModel> ForDriver(string driverId)
            => ReservationRequestFixtures.All;
    }
}
