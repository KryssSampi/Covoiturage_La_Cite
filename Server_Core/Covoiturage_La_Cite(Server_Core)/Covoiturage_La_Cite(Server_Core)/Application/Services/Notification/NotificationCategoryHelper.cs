using Covoiturage_La_Cite_Server_Core_.Domain.Enums;

namespace Covoiturage_La_Cite_Server_Core_.Application.Services.Notification;

/// <summary>
/// Mappe chaque NotificationType vers sa catégorie de priorité.
/// Utilisé par NotificationService pour décider d'envoyer un email/push.
/// </summary>
public static class NotificationCategoryHelper
{
    public static NotificationCategory GetCategory(NotificationType type) => type switch
    {
        // ── Primordiales (action requise / sécurité) ─────────────────────────
        NotificationType.ReservationReceived  => NotificationCategory.Primordiale,
        NotificationType.ReservationCancelled => NotificationCategory.Primordiale,
        NotificationType.TripCancelled        => NotificationCategory.Primordiale,
        NotificationType.TripStartingSoon     => NotificationCategory.Primordiale,
        NotificationType.PenaltyApplied       => NotificationCategory.Primordiale,
        NotificationType.SosAlert             => NotificationCategory.Primordiale,
        NotificationType.DocumentValidated    => NotificationCategory.Primordiale,

        // ── Secondaires (informations utiles) ───────────────────────────────
        NotificationType.ReservationAccepted  => NotificationCategory.Secondaire,
        NotificationType.ReservationRefused   => NotificationCategory.Secondaire,
        NotificationType.TripStarted          => NotificationCategory.Secondaire,
        NotificationType.TripCompleted        => NotificationCategory.Secondaire,
        NotificationType.NewReview            => NotificationCategory.Secondaire,
        NotificationType.BadgeEarned          => NotificationCategory.Secondaire,
        NotificationType.ChallengeCompleted   => NotificationCategory.Secondaire,
        NotificationType.GoScoreMilestone     => NotificationCategory.Secondaire,
        NotificationType.Welcome              => NotificationCategory.Secondaire,
        NotificationType.HowItWorks           => NotificationCategory.Secondaire,

        // ── Négligeables (informatif / promotionnel) ─────────────────────────
        NotificationType.Suggestion           => NotificationCategory.Negligeable,
        NotificationType.GoTaskCompleted      => NotificationCategory.Negligeable,
        NotificationType.RecommendedTrip      => NotificationCategory.Negligeable,
        NotificationType.System               => NotificationCategory.Negligeable,

        _ => NotificationCategory.Negligeable
    };
}
