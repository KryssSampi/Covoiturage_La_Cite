// ============================================================
//  Core/Models/ReservationRequestModel.cs
//  Modèle d'une demande de réservation (vue conducteur)
//  et d'une réservation enrichie (vue passager).
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    // ── Profil abrégé du demandeur ───────────────────────────
    public record ApplicantProfile(
        string Id,
        string Name,
        string? UrlPicture,
        double Note,
        int DoneTrips
    );

    // ── Profil abrégé du conducteur (vue passager) ───────────
    public partial record ReservationRequestDriverProfile(
        string Id,
        string Name,
        string? PictureUrl,
        double Rating,
        int TripsCount
    );

    // ── Passager dans la liste des passagers d'une réservation
    public record PassengerAvatar(
        string Id,
        string Name,
        string? AvatarUrl
    );

    // ── Demande de réservation (conducteur voit ça) ──────────
    public class ReservationRequestModel
    {
        public string Id { get; init; } = "";
        public ApplicantProfile Applicant { get; init; } = null!;
        public string Departure { get; init; } = "";
        public string Destination { get; init; } = "";
        public string Date { get; init; } = "";
        public string Time { get; init; } = "";
        public int CurrentPassengers { get; init; }
        public int MaxPassengers { get; init; }
        public double Price { get; init; }
        public string TripId { get; init; } = "";
        public string Status { get; init; } = "pending";
    }

    // ── Réservation enrichie (passager voit ça) ──────────────
    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Cancelled,
        Completed,
        InProgress,
        Rejected
    }

    public class ReservationModel
    {
        public string Id { get; init; } = "";
        public ReservationRequestDriverProfile Driver { get; init; } = null!;
        public string Departure { get; init; } = "";
        public string Destination { get; init; } = "";
        public string Date { get; init; } = "";
        public string Time { get; init; } = "";
        public int MaxPassengers { get; init; }
        public IReadOnlyList<PassengerAvatar> Passengers { get; init; } = Array.Empty<PassengerAvatar>();
        public ReservationStatus Status { get; init; }
        public string TripId { get; init; } = "";
    }
}
