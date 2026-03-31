// Features/planner/fixtures/PlannerFixtures.cs

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.planner.Fixtures;

public static class PlannerFixtures
{
    private static readonly DateTime Today = DateTime.Today;

    // ── Fixtures Conducteur ───────────────────────────────────────────

    public static IReadOnlyList<PlannerRideItem> DriverItems() => new List<PlannerRideItem>
    {
        new DriverRideItem(
            Card: new DriverTripCardDisplayModel(
                EtaLabel: "Arrivée estimée à 07:40",
                TripId: "t1", TimeLabel: "07:40",
                Route: new RouteDisplayModel("Campus La Cité", "Place d'Orléans", "07:40", "08:15"),
                PassengerLabel: "0/3 passagers", Price: 5m,
                Status: DriverTripStatus.Published,
                PendingRequests: 2, ProgressPercent: 0),
            Status: DriverTripStatusEnum.Published,
            Date: Today),

        new DriverRideItem(
            Card: new DriverTripCardDisplayModel(
                EtaLabel: "Arrivée estimée à 17:35",
                TripId: "t2", TimeLabel: "17:00",
                Route: new RouteDisplayModel("Avenue Laurier", "Collège La Cité", "17:00", "17:35"),
                PassengerLabel: "1/3 passagers", Price: 7m,
                Status: DriverTripStatus.InProgress,
                PendingRequests: 0, ProgressPercent: 0.38),
            Status: DriverTripStatusEnum.InProgress,
            Date: Today),

        new DriverRideItem(
            Card: new DriverTripCardDisplayModel(
                EtaLabel : "Arrivée estimée à 09:00",
                TripId: "t3", TimeLabel: "08:30",
                Route: new RouteDisplayModel("Maison", "Campus La Cité", "08:30", "09:00"),
                PassengerLabel: "2/2 passagers", Price: 8m,
                Status: DriverTripStatus.Completed,
                PendingRequests: 0, ProgressPercent: 1.0,
                LastPassengerAvatar: new AvatarDisplayModel("CG","#EEF0F5","#545D6E"),
                LastPassengerName: "Camille G."),
            Status: DriverTripStatusEnum.Completed,
            Date: Today.AddDays(-1)),

        new DriverRideItem(
            Card: new DriverTripCardDisplayModel(
                EtaLabel: "Arrivée estimée à 09:00",
                TripId: "t4", TimeLabel: "09:00",
                Route: new RouteDisplayModel("Campus La Cité", "Barrhaven", "09:00", "09:45"),
                PassengerLabel: "0/3 passagers", Price: 12m,
                Status: DriverTripStatus.Cancelled,
                PendingRequests: 0, ProgressPercent: 0),
            Status: DriverTripStatusEnum.Cancelled,
            Date: Today.AddDays(2)),
    };

    // ── Fixtures Passager ─────────────────────────────────────────────

    public static IReadOnlyList<PlannerRideItem> PassengerItems() => new List<PlannerRideItem>
    {
        new PassengerRideItem(
            Card: new PassengerReservationCardDisplayModel(
                DriverAvatar: new AvatarDisplayModel("SL","#E8F0FE","#1A56CC"),
                DriverName: "Sophie Leclerc",
                DriverRating: 4.7, DriverTripCount: 28,
                TimeLabel: "07:40",
                Route: new RouteDisplayModel("Campus…", "Place d'Orléans", "07:40","08:15"),
                Price: 5m,
                Status: PassengerReservationStatus.Pending),
            Status: PassengerReservationStatusEnum.Pending,
            Date: Today),

        new PassengerRideItem(
            Card: new PassengerReservationCardDisplayModel(
                DriverAvatar: new AvatarDisplayModel("MJ","#E1F5EE","#0F6E56"),
                DriverName: "Marc-Antoine J.",
                DriverRating: 4.9, DriverTripCount: 134,
                TimeLabel: "08:00",
                Route: new RouteDisplayModel("Stationnement B","La Cité","08:00","08:35"),
                Price: 8m,
                Status: PassengerReservationStatus.Confirmed,
                VehicleLabel: "Honda Civic · Grise · ABC-4521"),
            Status: PassengerReservationStatusEnum.Confirmed,
            Date: Today),

        new PassengerRideItem(
            Card: new PassengerReservationCardDisplayModel(
                DriverAvatar: new AvatarDisplayModel("SP","#EEF0F5","#545D6E"),
                DriverName: "Sophie P.",
                DriverRating: 4.6, DriverTripCount: 47,
                TimeLabel: "17:00",
                Route: new RouteDisplayModel("Avenue Laurier","La Cité","17:00","17:35"),
                Price: 7m,
                Status: PassengerReservationStatus.Completed,
                CanRate: true),
            Status: PassengerReservationStatusEnum.Completed,
            Date: Today.AddDays(-1)),
    };

    // ── Indisponibilités existantes ───────────────────────────────────

    public static List<UnavailabilityDisplayModel> Unavailabilities() => new()
    {
        new("u1",
            "Lundi & Jeudi · 08:00 – 12:00",
            "Récurrent · Toutes les semaines",
            IsRecurrent: true,
            SpecificDate: null,
            StartTime: new TimeSpan(8,0,0),
            EndTime:   new TimeSpan(12,0,0),
            RecurringDays: new[] { DayOfWeek.Monday, DayOfWeek.Thursday }),

        new("u2",
            $"{DateTime.Today.AddDays(1):dd MMMM yyyy} · 07:00 – 23:59",
            "Journée spécifique",
            IsRecurrent: false,
            SpecificDate: DateTime.Today.AddDays(1),
            StartTime: new TimeSpan(7,0,0),
            EndTime:   new TimeSpan(23,59,0),
            RecurringDays: Array.Empty<DayOfWeek>()),
    };
}

