// ============================================================
//  Core/Models/NotificationModel.cs
//  Modèle unifié des notifications (miroir du web)
//  Payloads contextuels embarqués pour affichage sans requête.
// ============================================================

namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    // ── Types de notification ────────────────────────────────
    public enum NotificationType
    {
        ReservationReceived,   // Conducteur : nouvelle demande
        ReservationSent,       // Passager   : accusé de réception
        ReservationAccepted,   // Passager   : demande acceptée
        ReservationRefused,    // Passager   : demande refusée
        ReservationCancelled,  // Les deux   : réservation annulée
        TripCreated,           // Conducteur : trajet publié
        TripStartingSoon,      // Les deux   : départ imminent
        TripStarted,           // Passager   : trajet démarré
        TripCompleted,         // Les deux   : trajet terminé
        TripCancelled,         // Passager   : trajet annulé
        NewReviewReceived,     // Les deux   : nouvel avis
        CancellationPenalty,   // Les deux   : pénalité appliquée
        SecurityAlert,         // Les deux   : nouvelle connexion
        System                 // Générique
    }

    // ── Payload : détails trajet ─────────────────────────────
    public record NotificationTripDetails(
        string TripId,
        string Departure,
        string Arrival,
        string Date,        // "YYYY-MM-DD"
        string Time,        // "HH:mm"
        double Price,
        int? AvailableSeats,
        int? EstimatedDurationMinutes
    );

    // ── Payload : détails réservation ───────────────────────
    public record NotificationReservationDetails(
        string ReservationId,
        string? PassengerName,
        string? PassengerAvatar,
        double? PassengerRating,
        int? PassengerTripCount,
        string? DriverName,
        string? DriverAvatar
    );

    // ── Payload : détails avis ───────────────────────────────
    public record NotificationReviewDetails(
        string ReviewId,
        string ReviewerName,
        string? ReviewerAvatar,
        double Rating,
        string Comment
    );

    // ── Payload : alerte sécurité ────────────────────────────
    public record NotificationSecurityDetails(
        string ClientType,    // "web" | "mobile"
        string? Location,
        string? UserAgent
    );

    // ── Modèle principal ─────────────────────────────────────
    public class NotificationModel
    {
        public string Id { get; init; } = "";
        public string UserId { get; init; } = "";

        public NotificationType Type { get; init; }
        public string Title { get; init; } = "";
        public string Message { get; init; } = "";

        public bool IsRead { get; set; }
        public bool IsImportant { get; init; }

        public string? Link { get; init; }
        public string? LinkLabel { get; init; }

        public string? RelatedTripId { get; init; }
        public string? RelatedReservationId { get; init; }

        // Payloads contextuels enrichis
        public NotificationTripDetails? TripDetails { get; init; }
        public NotificationReservationDetails? ReservationDetails { get; init; }
        public NotificationReviewDetails? ReviewDetails { get; init; }
        public NotificationSecurityDetails? SecurityDetails { get; init; }

        public string CreatedAt { get; init; } = "";
    }

    // ── Constantes ───────────────────────────────────────────
    public static class NotificationConstants
    {
        public static readonly IReadOnlySet<NotificationType> ImportantTypes =
            new HashSet<NotificationType>
            {
                NotificationType.ReservationReceived,
                NotificationType.ReservationAccepted,
                NotificationType.TripStartingSoon,
                NotificationType.TripStarted,
                NotificationType.TripCancelled,
                NotificationType.SecurityAlert,
                NotificationType.CancellationPenalty,
            };

        public static bool IsImportant(NotificationType type)
            => ImportantTypes.Contains(type);
    }
}
