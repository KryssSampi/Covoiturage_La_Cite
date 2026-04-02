namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

public enum NotificationType
{
    ReservationReceived,
    ReservationAccepted,
    ReservationRefused,
    ReservationCancelled,
    TripStartingSoon,
    TripStarted,
    TripCompleted,
    TripCancelled,
    PenaltyApplied,
    NewReview,
    DocumentValidated,
    SosAlert,
    Suggestion,
    BadgeEarned,
    ChallengeCompleted,
    System
}
