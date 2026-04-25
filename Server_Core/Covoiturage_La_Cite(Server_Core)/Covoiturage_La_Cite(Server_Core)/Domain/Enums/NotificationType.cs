namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

public enum NotificationType
{
    ReservationReceived,
    ReservationAccepted,
    ReservationRefused,
    ReservationCancelled,
    TripReminder,
    TripStartingSoon,
    TripStarted,
    TripCompleted,
    TripCancelled,
    PenaltyApplied,
    NewReview,
    DocumentValidated,
    SystemAlert,
    PaymentProcessed,
    SosAlert,
    Suggestion,
    BadgeEarned,
    ChallengeCompleted,
    System,
    // ── Bienvenue & onboarding ─────────────────────────────────────────────────
    Welcome,
    HowItWorks,
    // ── Gamification ──────────────────────────────────────────────────────────
    GoTaskCompleted,
    GoScoreMilestone,
    // ── Recommandations ───────────────────────────────────────────────────────
    RecommendedTrip
}
