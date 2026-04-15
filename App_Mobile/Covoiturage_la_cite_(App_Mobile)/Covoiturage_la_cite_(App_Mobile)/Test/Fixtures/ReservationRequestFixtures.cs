// ============================================================
//  Test/Fixtures/ReservationRequestFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class ReservationRequestFixtures
    {
        public static readonly IReadOnlyList<ReservationRequestModel> All = new List<ReservationRequestModel>
        {
            new()
            {
                Id          = "req-001",
                TripId      = "trip-001",
                Departure   = "Campus La Cité, Ottawa",
                Destination = "Place d'Orléans",
                Date        = "2026-04-02",
                Time        = "08:00",
                CurrentPassengers = 1,
                MaxPassengers     = 4,
                Price       = 8.00,
                Status      = "pending",
                Applicant   = new ApplicantProfile(
                    Id:        "user-pass-01",
                    Name:      "Marie Tremblay",
                    UrlPicture: null,
                    Note:      4.8,
                    DoneTrips: 12
                ),
            },
            new()
            {
                Id          = "req-002",
                TripId      = "trip-001",
                Departure   = "Campus La Cité, Ottawa",
                Destination = "Place d'Orléans",
                Date        = "2026-04-02",
                Time        = "08:00",
                CurrentPassengers = 2,
                MaxPassengers     = 4,
                Price       = 8.00,
                Status      = "pending",
                Applicant   = new ApplicantProfile(
                    Id:        "user-pass-02",
                    Name:      "Luc Fontaine",
                    UrlPicture: null,
                    Note:      4.3,
                    DoneTrips: 5
                ),
            },
        };
    }
}
