// ============================================================
//  Core/Models/TripViewData.cs
//  Données de vue d'un trajet publié (miroir du web)
//  Utilisé par TripDetailPage et PassengerReservationDetailPage.
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    // ── Rôle du spectateur ───────────────────────────────────
    public enum TripViewerRole
    {
        Passenger,
        DriverOwner,
        Admin
    }

    // ── Statut de réservation existante ─────────────────────
    public enum TripReservationStatus
    {
        None,
        Pending,
        Confirmed,
        Refused,
        Cancelled
    }

    // ── Type et méthode de paiement ─────────────────────────
    public enum TripType { Unique, Recurrent }
    public enum PaymentMethod { Cash, Interac }

    // ── Conducteur affiché ───────────────────────────────────
    public record TripDriver(
        string Id,
        string FirstName,
        string? AvatarUrl,
        double Rating,
        int TripCount
    );

    // ── Véhicule affiché ─────────────────────────────────────
    public record TripVehicle(
        string Label,
        string Color,
        string? ImageUrl
    );

    // ── Point (départ ou arrivée) ────────────────────────────
    public record TripPoint(
        string Label,
        string FullAddress,
        string? Instructions,
        double? Lat,
        double? Lng
    );

    // ── Préférences du trajet ────────────────────────────────
    public record TripPreferences(
        bool BaggageAllowed,
        bool PetsAllowed,
        bool SmokingAllowed,
        bool MusicAllowed,
        bool FlexibleItinerary,
        string? DriverNote
    );

    // ── Infos statut ─────────────────────────────────────────
    public record TripStatusInfo(
        TripType TripType,
        bool IsRecurrent,
        int? MaxDetourMinutes,
        string LastUpdatedAt
    );

    // ── Réservation existante (si passager déjà inscrit) ─────
    public record ExistingReservationInfo(
        TripReservationStatus Status,
        string UpdatedAt
    );

    // ── Vue complète du trajet publié ────────────────────────
    public class TripViewData
    {
        public string Id { get; init; } = "";
        public TripDriver Driver { get; init; } = null!;
        public TripVehicle Vehicle { get; init; } = null!;
        public TripPoint Departure { get; init; } = null!;
        public TripPoint Arrival { get; init; } = null!;

        /// <summary>Prix conducteur (frais exclus)</summary>
        public double PricePerPassenger { get; init; }
        /// <summary>Prix passager = PricePerPassenger × 1.15</summary>
        public double PassengerPrice { get; init; }

        public string DepartureDate { get; init; } = "";
        public string DepartureTime { get; init; } = "";
        public int EstimatedDuration { get; init; }  // minutes
        public double EstimatedDistance { get; init; } // km
        public int AvailableSeats { get; init; }
        public int TotalSeats { get; init; }

        public TripPreferences Preferences { get; init; } = null!;
        public TripStatusInfo Status { get; init; } = null!;
        public PaymentMethod PaymentMethod { get; init; }

        /// <summary>Polyline OSRM : liste de [lat, lng]</summary>
        public IReadOnlyList<(double Lat, double Lng)> LatLngs { get; init; }
            = Array.Empty<(double, double)>();
    }

    // ── Paramètres de navigation vers TripDetailPage ─────────
    public record TripDetailNavParams(
        TripViewData Trip,
        TripViewerRole ViewerRole,
        ExistingReservationInfo? ExistingReservation,
        string? Source,        // "reservation" | "publishedtrip"
        string? SourceStatus
    );
}
